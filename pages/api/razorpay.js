
/**
 * @fileOverview Neutralized Redundant API Node.
 * This file has been moved to src/pages/api/ or src/app/api/.
 */
export default function handler(req, res) {
  res.status(404).json({ error: "Deprecated endpoint. Use /src/app/api/ or /src/pages/api/" });
}
