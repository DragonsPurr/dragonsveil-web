import { isMedusaConfigured } from '@/app/lib/medusa';

export function MedusaConfigAlert() {
  if (isMedusaConfigured()) return null;
  return (
    <div
      className="rounded-lg border border-red-700 bg-red-900/40 px-4 py-3 font-cormorant_garamond text-lg text-red-100 mb-8"
      role="alert"
    >
      Medusa is not configured. Add <code className="text-sm">MEDUSA_PUBLISHABLE_KEY</code> (or{' '}
      <code className="text-sm">NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY</code>) to your environment (Medusa
      Admin → Settings → Publishable API Keys).
    </div>
  );
}
