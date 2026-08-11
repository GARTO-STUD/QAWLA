'use client';

import { useMemo, useState } from 'react';

type Transfer = {
  id?: string | number;
  player?: string;
  name?: string;
  from?: string;
  to?: string;
  fee?: string | number;
  status?: string;
  source?: string;
  [key: string]: unknown;
};

export function TransfersClient({ transfers }: { transfers: Transfer[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const filteredTransfers = useMemo(() => {
    const q = query.toLowerCase().trim();

    return transfers.filter((transfer) => {
      const text = Object.values(transfer)
        .filter((value) => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();

      const matchesQuery = !q || text.includes(q);

      const matchesStatus =
        status === 'all' ||
        String(transfer.status ?? '').toLowerCase() === status.toLowerCase();

      return matchesQuery && matchesStatus;
    });
  }, [transfers, query, status]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players, clubs..."
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border px-4 py-3"
        >
          <option value="all">All statuses</option>
          <option value="rumour">Rumour</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredTransfers.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center">
            No transfers found.
          </div>
        ) : (
          filteredTransfers.map((transfer, index) => (
            <article
              key={transfer.id ?? index}
              className="rounded-2xl border p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    {String(transfer.player ?? transfer.name ?? 'Unknown player')}
                  </h2>

                  <p className="mt-1 text-sm opacity-70">
                    {String(transfer.from ?? 'Unknown')} →{' '}
                    {String(transfer.to ?? 'Unknown')}
                  </p>
                </div>

                <div className="text-right text-sm">
                  {transfer.status && (
                    <span className="rounded-full border px-3 py-1">
                      {String(transfer.status)}
                    </span>
                  )}

                  {transfer.fee && (
                    <p className="mt-2 font-medium">
                      {String(transfer.fee)}
                    </p>
                  )}
                </div>
              </div>

              {transfer.source && (
                <p className="mt-4 text-xs opacity-60">
                  Source: {String(transfer.source)}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
