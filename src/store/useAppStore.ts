import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  messages: Message[];
  notifications: any[];
  themeMode: 'light' | 'dark';
  
  // Actions
  login: (email: string, role: UserRole) => void;
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
      isAuthenticated: false,
      isLoading: false,
      messages: [],
      notifications: [],
      themeMode: 'light',

      login: (email, role) => {
        const mockUser: User = role === 'student' ? {
          id: 's1',
          name: 'Dashrath Naik',
          email: email,
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
          college: 'Parul College of Engineering',
          course: 'Comp Science Engineering',
          year: '2nd Year'
        } : {
          id: 't1',
          name: 'Dr. Alan Smith',
          email: email,
          role: 'teacher',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
          college: 'University of Technology',
          course: 'Advanced Algorithms',
        };
        
        set({ user: mockUser, isAuthenticated: true });
      },

      logout: () => set({ user: null, isAuthenticated: false, messages: [] }),

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
