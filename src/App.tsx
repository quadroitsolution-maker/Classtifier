import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getTheme } from './theme';
import { useAppStore } from './store/useAppStore';

// Layout & Protection
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Splash from './pages/Splash';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Schedule from './pages/Schedule';
import Notifications from './pages/Notifications';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import ManageStudents from './pages/ManageStudents';
import RecoveryPlan from './pages/RecoveryPlan';
import TeacherQR from './pages/TeacherQR';
import StudentScan from './pages/StudentScan';
import AttendanceSuccessScreen from './components/ui/AttendanceSuccessScreen';

// FCM foreground listener
import { onForegroundMessage } from './services/fcmService';

export default function App() {
  const { themeMode } = useAppStore();
  const currentTheme = React.useMemo(() => getTheme(themeMode), [themeMode]);

  // Listen for foreground FCM messages
  React.useEffect(() => {
    onForegroundMessage((payload) => {
      // Show browser notification for foreground messages
      if (payload.notification) {
        new Notification(payload.notification.title || 'Classtifier', {
          body: payload.notification.body || '',
          icon: '/icon-192.png',
        });
      }
    });
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected Main App Routes */}
          <Route element={<Layout />}>
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute allowedRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage-students" 
              element={
                <ProtectedRoute allowedRole="teacher">
                  <ManageStudents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/schedule" 
              element={
                <ProtectedRoute>
                  <Schedule />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stats" 
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recovery-plan" 
              element={
                <ProtectedRoute>
                  <RecoveryPlan />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              } 
            />
          </Route>
          {/* QR Attendance routes */}
          <Route element={<ProtectedRoute allowedRole="teacher"/>}>
            <Route path="/teacher-qr" element={<TeacherQR/>} />
          </Route>
          <Route element={<ProtectedRoute allowedRole="student"/>}>
            <Route path="/scan" element={<StudentScan/>} />
          </Route>
          <Route path="/attendance-success" element={<AttendanceSuccessScreen/>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}
