
import payload from '@/app/lib/institutional-payload.json';

/**
 * @fileOverview Institutional Static Payload Registry v4.0.
 * Optimized for size and stability: Uses JSON import to avoid compiler crashes.
 */

export const INSTITUTIONAL_PAYLOAD = {
  version: payload.version,
  registry: payload.registry_name,
  lastAudit: "Feb 2026",
  weightNode: payload.weight_node,
  staticData: payload.nodes
};

export default INSTITUTIONAL_PAYLOAD;
