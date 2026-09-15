import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  Auth 
} from 'firebase/auth';
import { AuthUser, FirebaseCustomConfig } from '../types';

const STORAGE_KEY_FIREBASE_CONFIG = 'linchub_firebase_config';
const STORAGE_KEY_AUTH_USER = 'linchub_auth_user';

// Default Demo Admin credentials for testing without Firebase setup
export const DEMO_ADMIN = {
  email: 'admin@linchub.com',
  password: 'finance2026!',
  displayName: 'Admin Finance Linchub',
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

export function getSavedFirebaseConfig(): FirebaseCustomConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse saved Firebase config', err);
  }

  // Check Vite env
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (apiKey && projectId) {
    return {
      apiKey,
      projectId,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig | null) {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
    cachedApp = null;
    cachedAuth = null;
  } else {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
    cachedApp = null;
    cachedAuth = null;
  }
}

export function initFirebase(): { app: FirebaseApp; auth: Auth } | null {
  const config = getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (!cachedApp) {
      const existingApps = getApps();
      cachedApp = existingApps.length > 0 ? existingApps[0] : initializeApp(config);
      cachedAuth = getAuth(cachedApp);
    }
    return { app: cachedApp, auth: cachedAuth! };
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
    return null;
  }
}

export async function loginAdmin(email: string, password: string): Promise<AuthUser> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  const fbInstance = initFirebase();

  // If live Firebase Auth is configured, validate with real Firebase Auth
  if (fbInstance && fbInstance.auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(fbInstance.auth, cleanEmail, cleanPass);
      const fbUser = userCredential.user;
      const authUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email || cleanEmail,
        displayName: fbUser.displayName || 'Admin Finance',
        role: 'admin_finance',
      };
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authUser));
      return authUser;
    } catch (fbError: any) {
      const code = fbError?.code || '';
      let message = 'Gagal masuk. Periksa kembali email dan password Anda.';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        message = 'Email atau password yang Anda masukkan tidak terdaftar / salah.';
      } else if (code === 'auth/invalid-email') {
        message = 'Format alamat email tidak valid.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Terlalu banyak percobaan gagal. Akses ditangguhkan sementara demi keamanan.';
      }
      throw new Error(message);
    }
  }

  // Fallback demo account validation
  if (cleanEmail === DEMO_ADMIN.email.toLowerCase() && cleanPass === DEMO_ADMIN.password) {
    const authUser: AuthUser = {
      uid: 'admin-linchub-01',
      email: DEMO_ADMIN.email,
      displayName: DEMO_ADMIN.displayName,
      role: 'admin_finance',
    };
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authUser));
    return authUser;
  }

  // Also allow any valid email + demo password if user wants to test with their email
  if (cleanPass === DEMO_ADMIN.password && cleanEmail.includes('@')) {
    const authUser: AuthUser = {
      uid: 'custom-admin-' + Date.now(),
      email: cleanEmail,
      displayName: 'Admin Finance (' + cleanEmail.split('@')[0] + ')',
      role: 'admin_finance',
    };
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authUser));
    return authUser;
  }

  throw new Error('Email atau kata sandi tidak cocok. Silakan periksa kembali akun admin Anda.');
}

export function getSavedSessionUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error(err);
  }
  return null;
}

export async function logoutAdmin(): Promise<void> {
  const fbInstance = initFirebase();
  if (fbInstance && fbInstance.auth) {
    try {
      await firebaseSignOut(fbInstance.auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
  }
  localStorage.removeItem(STORAGE_KEY_AUTH_USER);
}
