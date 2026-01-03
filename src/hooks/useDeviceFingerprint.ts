import { useMemo } from 'react';

/**
 * Generates a simple device fingerprint based on available browser/device info.
 * This is not cryptographically secure but provides reasonable uniqueness for
 * one-phone-one-vote enforcement.
 */
export const useDeviceFingerprint = () => {
  const fingerprint = useMemo(() => {
    const components: string[] = [];
    
    // Screen properties
    components.push(`${screen.width}x${screen.height}`);
    components.push(`${screen.colorDepth}`);
    components.push(`${screen.pixelDepth || 0}`);
    
    // Navigator properties
    components.push(navigator.userAgent);
    components.push(navigator.language);
    components.push(navigator.platform || 'unknown');
    components.push(`${navigator.hardwareConcurrency || 0}`);
    components.push(`${(navigator as any).deviceMemory || 0}`);
    
    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    // Touch support
    components.push(`${navigator.maxTouchPoints || 0}`);
    
    // Canvas fingerprint (simplified)
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        components.push(canvas.toDataURL().slice(-50));
      }
    } catch {
      components.push('no-canvas');
    }
    
    // Create hash from components
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36) + '-' + Date.now().toString(36).slice(-4);
  }, []);
  
  return fingerprint;
};

/**
 * Get device fingerprint synchronously (for use outside React components)
 */
export const getDeviceFingerprint = (): string => {
  const components: string[] = [];
  
  // Screen properties
  components.push(`${screen.width}x${screen.height}`);
  components.push(`${screen.colorDepth}`);
  components.push(`${screen.pixelDepth || 0}`);
  
  // Navigator properties
  components.push(navigator.userAgent);
  components.push(navigator.language);
  components.push(navigator.platform || 'unknown');
  components.push(`${navigator.hardwareConcurrency || 0}`);
  components.push(`${(navigator as any).deviceMemory || 0}`);
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Touch support
  components.push(`${navigator.maxTouchPoints || 0}`);
  
  // Canvas fingerprint (simplified)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    components.push('no-canvas');
  }
  
  // Create hash from components
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36) + '-' + Date.now().toString(36).slice(-4);
};
