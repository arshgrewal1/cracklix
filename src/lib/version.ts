/**
 * @fileOverview Global Versioning Registry.
 * Synchronized with preparation node release cycle.
 */

export const PLATFORM_VERSION = {
  version: "1.0.4",
  build: "104",
  releaseDate: "Feb 24, 2026",
  isProduction: process.env.NODE_ENV === "production"
};

export default PLATFORM_VERSION;
