
import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * @fileOverview High-Fidelity Device Identity Utility.
 * Uses hardware fingerprinting to identify browser sessions for device locking.
 */

export async function getDeviceId(): Promise<string> {
  if (typeof window === 'undefined') return 'server-side';
  
  const fpPromise = FingerprintJS.load();
  const fp = await fpPromise;
  const result = await fp.get();
  
  return result.visitorId;
}

export function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Server';

  const userAgent = navigator.userAgent;
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
  else if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
  else if (userAgent.indexOf("Safari") > -1) browser = "Safari";
  else if (userAgent.indexOf("Edg") > -1) browser = "Edge";

  if (userAgent.indexOf("Android") > -1) os = "Android";
  else if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) os = "iOS";
  else if (userAgent.indexOf("Windows") > -1) os = "Windows";
  else if (userAgent.indexOf("Mac") > -1) os = "MacOS";

  return `${browser} on ${os}`;
}

export function getBrowserInfo() {
  if (typeof window === 'undefined') return { browser: 'Server', platform: 'Server' };
  return {
    browser: getDeviceName(),
    platform: navigator.platform || 'Unknown'
  };
}
