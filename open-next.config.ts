import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// OpenNext Cloudflare configuration.
// Builds the Next.js app into a Cloudflare Workers-compatible bundle.
// https://opennext.js.org/cloudflare

export default defineCloudflareConfig({
  // The edge proxy (middleware) is included in the bundle automatically.
  // Explicit configuration options below override defaults.

  // Use the Workers runtime for all routes (no Node.js compatibility layer
  // needed since we use Web APIs throughout).
  compatibility: 'workers',

  // Cache static assets on Cloudflare's edge for up to a year.
  assets: {
    binding: 'ASSETS',
    experimentalBundler: true,
  },

  // KV bindings (defined in wrangler.toml) are made available via env.
  // We don't use KV directly — Firestore is our database — but the binding
  // is here for future rate-limit cross-isolate coordination.
  kv: [],

  // Override the native nodejs compatibility flag.
  nodejsCompat: false,

  // The main worker entry.
  workerEntryPoint: '.open-next/worker.js',
});
