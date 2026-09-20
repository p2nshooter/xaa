/**
 * The seven stages of an XAA build, in order.
 *
 * Shared by the marketing pages and by the portal's stepper, so what we
 * promise on /process is literally the same list the client watches tick over
 * inside their project.
 */
export const STAGES = [
  { key: 'order', name: 'Order placed', blurb: 'Package selected and project opened.' },
  { key: 'deposit', name: '10% deposit', blurb: 'Booking deposit confirmed, slot reserved.' },
  { key: 'brief', name: 'Concept upload', blurb: 'You upload the concept, references and content.' },
  { key: 'schedule', name: 'Delivery date issued', blurb: 'We confirm scope and publish the completion estimate.' },
  { key: 'production', name: '40% — production', blurb: 'Cumulative 50% paid; the build runs to 80%.' },
  { key: 'settlement', name: '50% — settlement', blurb: 'At 75–80% progress the balance is settled.' },
  { key: 'delivery', name: 'Handover at 100%', blurb: 'Final build, deployment, training and source handover.' },
] as const;

export type StageKey = (typeof STAGES)[number]['key'];
