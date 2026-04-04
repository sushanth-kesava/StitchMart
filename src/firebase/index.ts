
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services if they haven't been initialized already.
 * Returns the app, firestore, and auth instances.
 */
export function initializeFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } {
  // Firebase is currently optional during MongoDB migration.

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  let auth: any = null;
  try {
    auth = getAuth(app);
  } catch (e) {
    auth = null;
  }

  return { app, db, auth: auth as Auth };
}

export * from './provider';
export * from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
