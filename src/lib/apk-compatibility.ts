/**
 * @fileOverview APK Compatibility Layer v1.0
 * FIXED: Handles Android APK-specific issues and fallbacks
 */

export interface PlatformCapabilities {
  isAndroid: boolean;
  isIOS: boolean;
  isWeb: boolean;
  isCapacitor: boolean;
  canUseLocalStorage: boolean;
  canUseIndexedDB: boolean;
  canUseWebWorker: boolean;
}

export class APKCompatibility {
  static getPlatformCapabilities(): PlatformCapabilities {
    if (typeof window === 'undefined') {
      return {
        isAndroid: false,
        isIOS: false,
        isWeb: false,
        isCapacitor: false,
        canUseLocalStorage: false,
        canUseIndexedDB: false,
        canUseWebWorker: false,
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isCapacitor = !!(window as any).Capacitor;

    return {
      isAndroid,
      isIOS,
      isWeb: !isAndroid && !isIOS,
      isCapacitor,
      canUseLocalStorage: this.checkLocalStorage(),
      canUseIndexedDB: this.checkIndexedDB(),
      canUseWebWorker: this.checkWebWorker(),
    };
  }

  private static checkLocalStorage(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private static checkIndexedDB(): boolean {
    try {
      return !!(window as any).indexedDB;
    } catch {
      return false;
    }
  }

  private static checkWebWorker(): boolean {
    try {
      return typeof Worker !== 'undefined';
    } catch {
      return false;
    }
  }

  static async getStorage(key: string): Promise<string | null> {
    try {
      if (this.getPlatformCapabilities().canUseLocalStorage) {
        return localStorage.getItem(key);
      }
      // Fallback to memory storage
      return (window as any).__memoryStorage?.[key] || null;
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  }

  static async setStorage(key: string, value: string): Promise<boolean> {
    try {
      if (this.getPlatformCapabilities().canUseLocalStorage) {
        localStorage.setItem(key, value);
        return true;
      }
      // Fallback to memory storage
      if (!(window as any).__memoryStorage) {
        (window as any).__memoryStorage = {};
      }
      (window as any).__memoryStorage[key] = value;
      return true;
    } catch (error) {
      console.error('Storage write error:', error);
      return false;
    }
  }

  static sanitizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If starts with +91, remove it
    if (digits.startsWith('91')) {
      return digits.slice(2);
    }
    
    // If 10 digits, return as is
    if (digits.length === 10) {
      return digits;
    }
    
    // If 11 digits and starts with 0, remove leading 0
    if (digits.length === 11 && digits.startsWith('0')) {
      return digits.slice(1);
    }
    
    return digits.slice(-10); // Take last 10 digits
  }

  static isValidPhoneNumber(phone: string): boolean {
    const sanitized = this.sanitizePhoneNumber(phone);
    return /^[6-9]\d{9}$/.test(sanitized);
  }

  static async requestPermissions(permission: 'camera' | 'location' | 'contacts'): Promise<boolean> {
    if (!this.getPlatformCapabilities().isCapacitor) {
      return false;
    }

    try {
      const { Permissions } = (window as any).Capacitor.Plugins;
      const result = await Permissions.query({ name: permission });
      
      if (result.state === 'denied') {
        const requestResult = await Permissions.requestPermissions([permission]);
        return requestResult.state === 'granted';
      }
      
      return result.state === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }
}

export default APKCompatibility;
