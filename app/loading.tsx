import { HeroSkeleton, ArticleGridSkeleton } from '@/components/premium';

export default function Loading() {
  return (
    <>
      <HeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <ArticleGridSkeleton count={6} />
      </div>
    </>
  );
}
