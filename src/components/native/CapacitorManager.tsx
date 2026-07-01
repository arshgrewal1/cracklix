'use client';

import { useEffect } from 'react';
import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useUser } from '@/firebase';

/**
 * @fileOverview Production Capacitor Bridge v3.1.
 * Handles hardware back button, system status bars, and external browser routing.
 * REMOVED: Global privacy screen toggle. This is now managed by AntiCheat component.
 */
export default function CapacitorManager() {

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backListenerHandle: PluginListenerHandle | null = null;
    let urlListenerHandle: PluginListenerHandle | null = null;

    const setupListeners = async () => {
      // 1. Hardware Back Button Protocol
      backListenerHandle = await App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });

      // 2. Status Bar Standard (Matches Website Branding)
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0B1528' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (e) {
        console.warn('[NATIVE_BRIDGE] StatusBar init failed');
      }

      // 3. App Deep Linking
      urlListenerHandle = await App.addListener('appUrlOpen', (data) => {
        const slug = data.url.split('.app').pop();
        if (slug) window.location.href = slug;
      });
    };

    setupListeners();

    // 4. External Link Interceptor (PDFs and Third-Party)
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href && Capacitor.isNativePlatform()) {
        try {
          const url = new URL(anchor.href);
          const isExternal = url.hostname !== window.location.hostname;
          const isPdf = anchor.href.toLowerCase().endsWith('.pdf');

          if (isExternal || isPdf) {
            e.preventDefault();
            Browser.open({ url: anchor.href });
          }
        } catch (e) {}
      }
    };

    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
      if (backListenerHandle) backListenerHandle.remove();
      if (urlListenerHandle) urlListenerHandle.remove();
    };
  }, []);

  return null;
}
