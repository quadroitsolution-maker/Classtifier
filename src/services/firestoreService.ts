import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string;
  department: string;
  semester: number;
  studentId: string;
  division: string;
  batch: string;
  college: string;
  fcmToken: string;
  onboardingComplete: boolean;
  createdAt: any;
  lastLogin: any;
}

/**
 * Check if a user document exists in Firestore
 */
export const userDocExists = async (uid: string): Promise<boolean> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

/**
 * Get user document from Firestore
 */
export const getUserDoc = async (uid: string): Promise<UserDocument | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserDocument;
  }
  return null;
};

/**
 * Create a new user document in Firestore
 */
export const createUserDoc = async (
  uid: string,
  data: Partial<UserDocument>
): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, {
    uid,
    name: data.name || '',
    email: data.email || '',
    role: data.role || 'student',
    avatar: data.avatar || '',
    department: data.department || '',
    semester: data.semester || 1,
    studentId: data.studentId || '',
    division: data.division || '',
    batch: data.batch || '',
    college: 'Parul University',
    fcmToken: data.fcmToken || '',
    onboardingComplete: data.onboardingComplete || false,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  });
};

/**
 * Update an existing user document
 */
export const updateUserDoc = async (
  uid: string,
  data: Partial<UserDocument>
): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...data,
    lastLogin: serverTimestamp(),
  });
};

/**
 * Save FCM token to user document
 */
export const saveFCMToken = async (uid: string, token: string): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { fcmToken: token });
};

/**
 * Listen to user document changes (realtime)
 */
export const onUserDocSnapshot = (
  uid: string,
  callback: (data: UserDocument | null) => void
): Unsubscribe => {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as UserDocument);
    } else {
      callback(null);
    }
  });
};
