import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const ALLOWED_DOMAIN = 'paruluniversity.ac.in';

/**
 * Sign in with Google — restricted to @paruluniversity.ac.in emails
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email || '';

    // Validate domain
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      // Sign out if wrong domain
      await firebaseSignOut(auth);
      throw new Error(
        `Only @${ALLOWED_DOMAIN} email addresses are allowed. Please use your Parul University email.`
      );
    }

    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked. Please allow pop-ups and try again.');
    }
    throw error;
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
