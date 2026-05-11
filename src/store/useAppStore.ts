import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserDocument } from '../services/firestoreService';

export type UserRole = 'student' | 'teacher' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  college?: string;
  course?: string;
  year?: string;
  department?: string;
  semester?: number;
  studentId?: string;
  division?: string;
  batch?: string;
  onboardingComplete?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AppState {
  user: User | null;
  firebaseUid: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authInitialized: boolean;
  onboardingComplete: boolean;
  messages: Message[];
  notifications: any[];
  themeMode: 'light' | 'dark';
  
  // Actions
  login: (email: string, role: UserRole) => void;
  setFirebaseUser: (firebaseUser: FirebaseUser) => void;
  setUserFromFirestore: (userData: UserDocument) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setAuthInitialized: (initialized: boolean) => void;
  logout: () => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  clearMessages: () => void;
  setLoading: (isLoading: boolean) => void;
  toggleThemeMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      firebaseUid: null,
      isAuthenticated: false,
      isLoading: false,
      authInitialized: false,
      onboardingComplete: false,
      messages: [],
      notifications: [],
      themeMode: 'light',

      // Legacy mock login (kept for fallback/demo mode)
      login: (email, role) => {
        const mockUser: User = role === 'student' ? {
          id: 's1',
          name: 'Dashrath Naik',
          email: email,
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
          college: 'Parul University',
          course: 'Comp Science Engineering',
          year: '2nd Year',
          onboardingComplete: true,
        } : {
          id: 't1',
          name: 'Dr. Alan Smith',
          email: email,
          role: 'teacher',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
          college: 'Parul University',
          course: 'Advanced Algorithms',
          onboardingComplete: true,
        };
        
        set({ user: mockUser, isAuthenticated: true, onboardingComplete: true });
      },

      // Firebase user from Google Sign-In
      setFirebaseUser: (firebaseUser: FirebaseUser) => {
        const user: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: null, // Will be set during onboarding
          avatar: firebaseUser.photoURL || '',
          college: 'Parul University',
        };
        set({ 
          user, 
          firebaseUid: firebaseUser.uid,
          isAuthenticated: true,
        });
      },

      // Set user data from Firestore document
      setUserFromFirestore: (userData: UserDocument) => {
        const user: User = {
          id: userData.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
          college: userData.college,
          department: userData.department,
          semester: userData.semester,
          studentId: userData.studentId,
          division: userData.division,
          batch: userData.batch,
          onboardingComplete: userData.onboardingComplete,
        };
        set({ 
          user, 
          firebaseUid: userData.uid,
          isAuthenticated: true,
          onboardingComplete: userData.onboardingComplete,
        });
      },

      setOnboardingComplete: (complete: boolean) => set({ onboardingComplete: complete }),
      
      setAuthInitialized: (initialized: boolean) => set({ authInitialized: initialized }),

      logout: () => set({ 
        user: null, 
        firebaseUid: null,
        isAuthenticated: false, 
        onboardingComplete: false,
        messages: [] 
      }),

      addMessage: (content, role) => set((state) => ({
        messages: [...state.messages, {
          id: Math.random().toString(36).substring(7),
          role,
          content,
          timestamp: Date.now()
        }]
      })),

      clearMessages: () => set({ messages: [] }),

      setLoading: (isLoading) => set({ isLoading }),

      toggleThemeMode: () => set((state) => ({ 
        themeMode: state.themeMode === 'light' ? 'dark' : 'light' 
      }))
    }),
    {
      name: 'classtifier-storage',
    }
  )
);
