/**
 * @fileOverview Global Versioning Registry.
 * Synchronized with preparation node release cycle.
 */

export const PLATFORM_VERSION = {
  version: "1.0.5",
  build: "105",
  releaseDate: "Feb 25, 2026",
  isProduction: process.env.NODE_ENV === "production"
};

export default PLATFORM_VERSION;
