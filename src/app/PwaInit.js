'use client';
import { useEffect } from 'react';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

export default function PwaInit() {
  useEffect(() => {
    // Safely initializes the camera elements only after the browser has loaded
    if (typeof window !== 'undefined') {
      defineCustomElements(window);
    }
  }, []);

  return null; // This component doesn't render any UI
}