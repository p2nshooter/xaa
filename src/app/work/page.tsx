import { permanentRedirect } from 'next/navigation';

/**
 * The capabilities page used to live at /work, which promised a portfolio and
 * delivered a stack list. It moved to /capabilities, matching its own nav
 * label; this keeps the old path — and anything already linking to it — alive.
 */
export default function WorkRedirect() {
  permanentRedirect('/capabilities');
}
