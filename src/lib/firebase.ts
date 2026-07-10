import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Garante que existe uma sessão no Firebase Auth (real ou anônima) antes de
// qualquer escrita no Firestore. Login por senha antiga não autentica no
// Firebase, e o próprio onAuthStateChanged/signInAnonymously é assíncrono —
// sem isso, escritas feitas logo após o carregamento podem cair com
// "Missing or insufficient permissions" por ainda não termos request.auth.
let authReadyPromise: Promise<User | null> | null = null;

export function ensureAuth(): Promise<User | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        unsub();
        if (user) {
          resolve(user);
          return;
        }
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch {
          // Anonymous sign-in pode estar desabilitado no console do Firebase.
          resolve(null);
        }
      });
    });
  }
  return authReadyPromise;
}

// Validation test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();
