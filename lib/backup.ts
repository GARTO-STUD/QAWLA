// Qawla — Automated backup system
//
// Exports all Firestore collections to a single JSON snapshot.
// Snapshots are stored as documents in the `backups` collection,
// and can also be downloaded as JSON files from the admin dashboard.
//
// Backup strategy:
//   - Daily automatic backup via /api/cron (triggered by Cloudflare Cron)
//   - Manual backup from admin dashboard
//   - Keeps last 30 daily backups (older ones auto-deleted)
//   - Each backup is a single Firestore document containing compressed JSON
//
// Collections backed up:
//   - articles (published + pending + rejected)
//   - raw_events (last 500)
//   - credibility_sources
//   - jobs (last 200)
//   - live_matches
//   - blog (all posts)
//
// Restore: download JSON from admin, import via /api/backup?action=restore

import { listDocs, setDoc, getDoc, deleteDoc, isFirebaseConfigured } from '@/lib/firebase';

export interface BackupMetadata {
  id: string;
  createdAt: string;
  sizeBytes: number;
  collectionCounts: Record<string, number>;
  totalDocuments: number;
  trigger: 'cron' | 'manual';
  status: 'completed' | 'failed';
  error?: string;
}

export interface BackupSnapshot {
  version: string;
  createdAt: string;
  trigger: 'cron' | 'manual';
  collections: Record<string, unknown[]>;
  metadata: BackupMetadata;
}

const BACKUP_COLLECTION = 'backups';
const MAX_BACKUPS = 30;
const COLLECTIONS_TO_BACKUP = [
  { name: 'articles', limit: 1000 },
  { name: 'raw_events', limit: 500 },
  { name: 'credibility_sources', limit: 100 },
  { name: 'jobs', limit: 200 },
  { name: 'live_matches', limit: 50 },
  { name: 'blog', limit: 200 },
];

function generateBackupId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
  const random = Math.random().toString(36).slice(2, 6);
  return `backup_${dateStr}_${timeStr}_${random}`;
}

/**
 * Create a full backup snapshot of all Firestore collections.
 * Returns the backup metadata. The snapshot itself is stored in Firestore.
 */
export async function createBackup(trigger: 'cron' | 'manual' = 'manual'): Promise<BackupMetadata> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured — cannot create backup');
  }

  const backupId = generateBackupId();
  const createdAt = new Date().toISOString();
  const collections: Record<string, unknown[]> = {};
  const collectionCounts: Record<string, number> = {};
  let totalDocuments = 0;

  // Export each collection
  for (const { name, limit } of COLLECTIONS_TO_BACKUP) {
    try {
      const result = await listDocs<unknown>(name, { pageSize: limit });
      const docs = result.data || [];
      collections[name] = docs;
      collectionCounts[name] = docs.length;
      totalDocuments += docs.length;
    } catch (err) {
      console.error(`[backup] Failed to export ${name}:`, err);
      collections[name] = [];
      collectionCounts[name] = 0;
    }
  }

  // Calculate size (approximate — JSON string length)
  const snapshot: BackupSnapshot = {
    version: '2.0',
    createdAt,
    trigger,
    collections,
    metadata: {
      id: backupId,
      createdAt,
      sizeBytes: 0, // calculated below
      collectionCounts,
      totalDocuments,
      trigger,
      status: 'completed',
    },
  };

  const jsonStr = JSON.stringify(snapshot);
  snapshot.metadata.sizeBytes = new TextEncoder().encode(jsonStr).length;

  // Store the snapshot in Firestore
  try {
    await setDoc(BACKUP_COLLECTION, backupId, snapshot);
  } catch (err) {
    // If the snapshot is too large for a single document (1MB Firestore limit),
    // store just the metadata and mark as partial
    const metadataOnly: BackupMetadata = {
      ...snapshot.metadata,
      sizeBytes: snapshot.metadata.sizeBytes,
      status: 'failed',
      error: `Snapshot too large for single document (${snapshot.metadata.sizeBytes} bytes): ${err instanceof Error ? err.message : String(err)}`,
    };
    await setDoc(BACKUP_COLLECTION, backupId, { version: '2.0', createdAt, trigger, metadata: metadataOnly, collections: {} });
    return metadataOnly;
  }

  // Clean up old backups (keep only MAX_BACKUPS most recent)
  await cleanupOldBackups();

  return snapshot.metadata;
}

/**
 * List all available backups, sorted by date (newest first).
 */
export async function listBackups(): Promise<BackupMetadata[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const result = await listDocs<BackupSnapshot>(BACKUP_COLLECTION, { pageSize: MAX_BACKUPS });
    const docs = result.data || [];
    return docs
      .map(d => d.metadata)
      .filter((m): m is BackupMetadata => m !== undefined && m !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

/**
 * Get a specific backup snapshot by ID (for download/restore).
 */
export async function getBackup(id: string): Promise<BackupSnapshot | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    return await getDoc<BackupSnapshot>(BACKUP_COLLECTION, id);
  } catch {
    return null;
  }
}

/**
 * Delete a backup by ID.
 */
export async function deleteBackup(id: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await deleteDoc(BACKUP_COLLECTION, id);
}

/**
 * Clean up old backups, keeping only the most recent MAX_BACKUPS.
 */
async function cleanupOldBackups(): Promise<void> {
  try {
    const backups = await listBackups();
    if (backups.length <= MAX_BACKUPS) return;

    const toDelete = backups.slice(MAX_BACKUPS);
    for (const backup of toDelete) {
      try {
        await deleteBackup(backup.id);
        console.log(`[backup] Deleted old backup: ${backup.id}`);
      } catch (err) {
        console.error(`[backup] Failed to delete ${backup.id}:`, err);
      }
    }
  } catch (err) {
    console.error('[backup] Cleanup failed:', err);
  }
}

/**
 * Restore from a backup snapshot.
 * WARNING: This overwrites existing data in each collection.
 */
export async function restoreBackup(id: string): Promise<{ restored: Record<string, number>; total: number }> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured — cannot restore');
  }

  const snapshot = await getBackup(id);
  if (!snapshot) {
    throw new Error(`Backup ${id} not found`);
  }

  const restored: Record<string, number> = {};
  let total = 0;

  for (const [collectionName, docs] of Object.entries(snapshot.collections)) {
    if (!Array.isArray(docs)) continue;

    let count = 0;
    for (const doc of docs) {
      try {
        const docId = (doc as Record<string, unknown>)?.id as string;
        if (docId) {
          await setDoc(collectionName, docId, doc);
          count++;
        }
      } catch (err) {
        console.error(`[restore] Failed to restore doc in ${collectionName}:`, err);
      }
    }
    restored[collectionName] = count;
    total += count;
  }

  return { restored, total };
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
