import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Default URLs for local development
const DEFAULTS = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://numi-backend.up.railway.app',
  signupUrl: process.env.NEXT_PUBLIC_SIGNUP_URL || 'https://numi-signup.vercel.app',
  dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://numi-dashboard.vercel.app',
};

export interface ServiceConfig {
  backendUrl: string;
  signupUrl: string;
  dashboardUrl: string;
}

// In-memory cache so we only fetch once per page load
let _cachedConfig: ServiceConfig | null = null;

/**
 * Fetches dynamic service URLs from Firestore `numi-config/services`.
 * Falls back to NEXT_PUBLIC_* env vars or hardcoded production defaults.
 * Cached after first successful fetch.
 */
export async function getServiceConfig(): Promise<ServiceConfig> {
  if (_cachedConfig) return _cachedConfig;

  try {
    const configRef = doc(db, 'numi-config', 'services');
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      const data = configSnap.data();
      _cachedConfig = {
        backendUrl: data.backendUrl || DEFAULTS.backendUrl,
        signupUrl: data.signupUrl || DEFAULTS.signupUrl,
        dashboardUrl: data.dashboardUrl || DEFAULTS.dashboardUrl,
      };
      return _cachedConfig;
    }
  } catch (e) {
    console.warn('[NuMi Config] Could not fetch from Firestore, using defaults:', e);
  }

  _cachedConfig = { ...DEFAULTS };
  return _cachedConfig;
}
