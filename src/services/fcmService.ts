import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { getFirebaseMessaging } from '../config/firebase';
import { saveFCMToken } from './firestoreService';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (uid: string): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.log('FCM not supported in this browser');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('FCM Token:', token);
      // Save token to Firestore
      await saveFCMToken(uid, token);
      return token;
    }

    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  getFirebaseMessaging().then((messaging) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
      });
    }
  });
};
