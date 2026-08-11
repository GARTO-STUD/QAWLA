import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <div className="relative inline-block mb-8">
          <p className="font-display font-extrabold text-8xl sm:text-9xl lg:text-[12rem] leading-none gradient-text-pitch">
            404
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5 rounded-full pitch-gradient" />
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-night mb-3">
          Off the pitch
        </h1>
        <p className="text-night/60 mb-8 max-w-md mx-auto">
          The page you're looking for has been substituted, sent off, or never existed in the first place. Let's get you back onside.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary justify-center">
            Back to home
          </Link>
          <Link href="/news" className="btn-secondary justify-center">
            Browse news
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
          {[
            { href: '/news', label: 'News' },
            { href: '/blog', label: 'Blog' },
            { href: '/live', label: 'Live' },
            { href: '/transfers', label: 'Transfers' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-night/70 hover:border-pitch hover:text-pitch-dk transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
