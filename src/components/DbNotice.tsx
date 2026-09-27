import { isQuota, type Problems } from '@/server/soft';

/** Shown above portal data when some of it could not be read. */
export function DbNotice({ problems }: { problems: Problems }) {
  if (problems.length === 0) return null;
  const quota = isQuota(problems);
  return (
    <div role="status" className="panel mt-6 border-l-4 border-l-amber-500 bg-amber-50 p-5 text-sm text-amber-900">
      <p className="font-bold">
        {quota ? 'Database daily read limit reached — some data is hidden until it resets' : 'Some data could not be loaded'}
      </p>
      {quota ? (
        <p className="mt-1">
          The Cloudflare free plan allows 5 million database row reads per day for the whole account (all sites share it).
          It resets at 00:00 UTC (07:00 WIB). Upgrading the account to Workers Paid ($5/month) raises the limit to 25 billion
          reads per month. Sign-in, the public site and the chat button keep working.
        </p>
      ) : (
        <p className="mt-1 break-words font-mono text-xs">{problems[0]}</p>
      )}
    </div>
  );
}
