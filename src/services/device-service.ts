import { Firestore, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, DeviceLock } from '@/types';
import { getDeviceId, getDeviceName } from '@/lib/device';

/**
 * @fileOverview Institutional Device Binding Logic v2.0.
 * FIXED: Secure type casting for toDate() call.
 */

export const DeviceService = {
  /**
   * Binds the current device to the user's account.
   */
  async bindCurrentDevice(db: Firestore, userId: string, enforcementLevel: 0 | 1 | 2 | 3 = 1) {
    const deviceId = await getDeviceId();
    const deviceName = getDeviceName();
    const userRef = doc(db, 'users', userId);

    const deviceLock: DeviceLock = {
      deviceId,
      deviceName,
      lastChangedAt: serverTimestamp(),
      enabled: true,
      enforcementLevel
    };

    return updateDoc(userRef, {
      deviceLock,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Validates if the current device matches the locked device.
   */
  async validateDevice(profile: UserProfile): Promise<{ 
    isValid: boolean; 
    currentDeviceId: string; 
    lockedDeviceId?: string;
    isGracePeriod: boolean;
  }> {
    const currentDeviceId = await getDeviceId();
    
    // Phase 1: If no lock exists, it's valid (will be auto-bound next)
    if (!profile.deviceLock || !profile.deviceLock.deviceId) {
      return { isValid: true, currentDeviceId, isGracePeriod: true };
    }

    const isValid = profile.deviceLock.deviceId === currentDeviceId;
    return { 
      isValid, 
      currentDeviceId, 
      lockedDeviceId: profile.deviceLock.deviceId,
      isGracePeriod: false
    };
  },

  /**
   * Checks if the user is eligible for a device change (30-day cooldown).
   */
  canChangeDevice(profile: UserProfile): { canChange: boolean; daysRemaining: number } {
    if (!profile.deviceLock?.lastChangedAt) return { canChange: true, daysRemaining: 0 };

    // Resolve date regardless of whether it's a Timestamp, Date, or string
    let lastChanged: Date;
    const ts = profile.deviceLock.lastChangedAt;
    
    if (ts && typeof ts.toDate === 'function') {
      lastChanged = ts.toDate();
    } else if (ts instanceof Date) {
      lastChanged = ts;
    } else {
      lastChanged = new Date(ts);
    }

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastChanged.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const cooldownDays = 30;
    const canChange = diffDays >= cooldownDays;
    
    return { 
      canChange, 
      daysRemaining: canChange ? 0 : cooldownDays - diffDays 
    };
  }
};
