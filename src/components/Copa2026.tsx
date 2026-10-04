import { Copa2026Burst } from "./Copa2026Burst";

/* Spain, world champion 2026: a ribbon above the header on every page, styled
 * in copa2026.css, plus a short burst of confetti once per visit. */
const TEXT: Record<string, string> = { default: "Spain · 2026 World Cup champions", es: "España, campeona del mundo 2026" };

export function Copa2026({ lang }: { lang?: string }) {
  const text = TEXT[(lang || "").slice(0, 2)] ?? TEXT.default;
  return (
    <div className="marfil26" role="note" aria-label={text}>
      <span className="marfil26-flag" aria-hidden="true" />
      <span className="marfil26-trophy" aria-hidden="true">🏆</span>
      <span className="marfil26-text">{text}</span>
      <span className="marfil26-pitch" aria-hidden="true">
        <span className="marfil26-ballx">
          <span className="marfil26-ball">⚽</span>
        </span>
      </span>
      <span className="marfil26-chip" aria-hidden="true">2026</span>
      <Copa2026Burst />
    </div>
  );
}
