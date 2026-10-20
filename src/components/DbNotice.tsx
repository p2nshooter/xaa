import { isMoving, type Problems } from '@/server/soft';

/** Shown above portal data when some of it could not be read. */
export function DbNotice({ problems }: { problems: Problems }) {
  if (problems.length === 0) return null;
  const moving = isMoving(problems);
  return (
    <div role="status" className="panel mt-6 border-l-4 border-l-amber-500 bg-amber-50 p-5 text-sm text-amber-900">
      <p className="font-bold">{moving ? 'Your records are moving to new storage — back in a few seconds' : 'Some data could not be loaded'}</p>
      {moving ? (
        <p className="mt-1">
          XAA is copying its records to new storage after an update. Nothing is lost; reload this page in a moment. Sign-in,
          the public site and the chat button keep working.
        </p>
      ) : (
        <p className="mt-1 break-words font-mono text-xs">{problems[0]}</p>
      )}
    </div>
  );
}
