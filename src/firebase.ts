import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log('Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId
});

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Check for common connection errors
  if (errInfo.error.includes('unavailable') || errInfo.error.includes('offline')) {
    console.warn('Firestore is currently unavailable. The app will operate in offline mode.');
  }
  
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    console.log('Testing Firestore connection...');
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection successful');
  } catch (error) {
    if(error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.error("Firestore connection failed: The backend is unreachable. Please check your network or Firebase configuration.");
    } else {
      // Silence the "Missing or insufficient permissions" warning as it's expected for the test document
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.log('Firestore connection verified (permissions active)');
      } else {
        console.warn('Firestore connection test info:', error);
      }
    }
  }
}
testConnection();
