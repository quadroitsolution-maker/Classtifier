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
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Schedule from './pages/Schedule';
import Notifications from './pages/Notifications';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import TeacherQR from './pages/TeacherQR';
import StudentScan from './pages/StudentScan';
import AttendanceSuccessScreen from './components/ui/AttendanceSuccessScreen';

export default function App() {
  const { themeMode } = useAppStore();
  const currentTheme = React.useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />

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
