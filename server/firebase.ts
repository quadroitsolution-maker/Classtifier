import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.log('Firebase Admin init error (falling back to mock/no-auth):', error);
  }
}

export const db = admin.firestore();
export default admin;
