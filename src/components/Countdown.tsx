'use client';

import { useEffect, useState } from 'react';
import { leftText } from '@/lib/time-left';

/** Time left until `to` (ISO), updated every second in the last hour and every 30 s before that. Server-rendered text first, so it reads without JavaScript. */
export function Countdown({ to, ended = 'Ended', initial }: { to: string; ended?: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [soon, setSoon] = useState(false);
  useEffect(() => {
    const end = Date.parse(to);
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const left = end - Date.now();
      setText(left <= 0 ? ended : leftText(left));
      setSoon(left > 0 && left < 3_600_000);
      if (left > 0) timer = setTimeout(tick, left < 3_600_000 ? 1000 : 30_000);
    };
    tick();
    return () => clearTimeout(timer);
  }, [to, ended]);
  return (
    <time dateTime={to} className={soon ? 'font-semibold text-red-600' : undefined} suppressHydrationWarning>
      {text}
    </time>
  );
}
