import React from "react";

type Coin = {
  symbol: string;
  name: string;
  address: string;
  network: string;
  icon?: string;
};

const coins: Coin[] = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", address: process.env.NEXT_PUBLIC_BTC_ADDRESS || "" },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum", address: process.env.NEXT_PUBLIC_ETH_ADDRESS || "" },
  { symbol: "USDT", name: "Tether", network: "TRC20", address: process.env.NEXT_PUBLIC_USDT_TRON_ADDRESS || "" },
  { symbol: "USDC", name: "USD Coin", network: "Ethereum", address: process.env.NEXT_PUBLIC_USDC_ADDRESS || "" },
];

export default function CryptoDonateCard() {
  const [selected, setSelected] = React.useState(coins[0]);
  const [copied, setCopied] = React.useState(false);

  async function copyAddress() {
    if (!selected.address) return;
    await navigator.clipboard?.writeText(selected.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section aria-labelledby="crypto-donation-title" className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-5 text-white shadow-2xl sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Support Qawla</p>
            <h2 id="crypto-donation-title" className="text-2xl font-bold tracking-tight sm:text-3xl">Donate with crypto</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              Choose a network, copy the verified donation address, and support independent journalism directly.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">Non-custodial</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {coins.map((coin) => (
            <button
              key={coin.symbol}
              type="button"
              onClick={() => { setSelected(coin); setCopied(false); }}
              className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                selected.symbol === coin.symbol
                  ? "border-violet-400/60 bg-violet-500/15 shadow-lg shadow-violet-950/30"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              }`}
              aria-pressed={selected.symbol === coin.symbol}
            >
              <div className="text-sm font-bold">{coin.symbol}</div>
              <div className="mt-1 text-xs text-zinc-500">{coin.name} · {coin.network}</div>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-zinc-400">Donation address</span>
            <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">Verified network</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <code className="min-w-0 flex-1 break-all rounded-xl bg-white/5 px-3 py-3 text-xs leading-5 text-zinc-300">
              {selected.address || "Address configured by site administrator"}
            </code>
            <button
              type="button"
              onClick={copyAddress}
              disabled={!selected.address}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? "Copied ✓" : "Copy address"}
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-amber-300/80">
            Send only {selected.symbol} on the {selected.network} network. Sending another asset or network may permanently lose funds.
          </p>
        </div>
      </div>
    </section>
  );
}
