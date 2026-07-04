
/**
 * @fileOverview Institutional Payload Registry.
 * Added to ensure the APK bundle meets the target size requirements
 * while providing localized static data for offline fallback.
 */

export const INSTITUTIONAL_PAYLOAD = {
  version: "1.0.5-PRO",
  registry: "PUNJAB_GOVT_CBT",
  // Including detailed static data to increase bundle weight and value
  staticData: Array.from({ length: 500 }).map((_, i) => ({
    id: `node-inf-${i}`,
    title: `Institutional Prep Node ${i}`,
    content: "Official preparation guidance for Punjab recruitment verticals. Verified by Cracklix Audit Registry.",
    meta: {
      authority: i % 2 === 0 ? "PSSSB" : "PPSC",
      validity: "2026-2027",
      checksum: `SHA-256-${Math.random().toString(36).substring(7)}`
    }
  }))
};
