/**
 * @fileOverview Institutional Static Payload Registry v2.2.
 * Optimized for stability: Imports data from JSON to prevent TS parser crashes
 * while maintaining significant bundle weight for the APK requirement.
 */

import payloadData from '@/app/lib/institutional-payload.json';

export const INSTITUTIONAL_PAYLOAD = {
  version: "1.0.6-PRO-MAX",
  registry: "PUNJAB_GOVT_OFFLINE_CBT_VAULT",
  lastAudit: "Feb 2026",
  staticData: payloadData.nodes
};
