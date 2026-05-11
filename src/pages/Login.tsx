import React from 'react';
import { Box, Typography, Button, Container, Paper, Tabs, Tab, CircularProgress, Alert, Collapse } from '@mui/material';
import { Google, ArrowBack, School, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore, UserRole } from '../store/useAppStore';
import { signInWithGoogle } from '../services/firebaseAuth';
import { getUserDoc } from '../services/firestoreService';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, setFirebaseUser, setUserFromFirestore } = useAppStore();
  const [role, setRole] = React.useState<UserRole>('student');
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      const firebaseUser = await signInWithGoogle();
      setFirebaseUser(firebaseUser);
      setSuccess(true);

      // Check if user doc exists (returning user)
      const userDoc = await getUserDoc(firebaseUser.uid);
      
      setTimeout(() => {
        if (userDoc && userDoc.onboardingComplete) {
          setUserFromFirestore(userDoc);
          const dashPath = userDoc.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
          navigate(dashPath, { replace: true });
        } else {
          // First time user — go to onboarding
          navigate('/onboarding', { replace: true });
        }
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Please try again.');
      setSuccess(false);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Demo mode fallback (for testing without Firebase)
  const handleDemoLogin = () => {
    login('demo@paruluniversity.ac.in', role);
    navigate(role === 'student' ? '/student-dashboard' : '/teacher-dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating gradient blobs */}
      <Box className="gradient-blob blob-1" />
      <Box className="gradient-blob blob-2" />
      <Box className="gradient-blob blob-3" />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Back button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ color: 'rgba(255,255,255,0.6)', mb: 3, fontWeight: 600 }}
          >
            Back
          </Button>

          {/* Glass card */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '28px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Logo & Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 12px 32px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  <School sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </motion.div>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  mb: 1,
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome to Classtifier 👋
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}
              >
                Sign in with your Parul University email
              </Typography>
            </Box>

            {/* Role Tabs */}
            <Paper
              elevation={0}
              sx={{
                p: 0.75,
                mb: 3,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Tabs
                value={role}
                onChange={(_, v) => setRole(v)}
                variant="fullWidth"
                sx={{
                  minHeight: 44,
                  '& .MuiTabs-indicator': {
                    height: '100%',
                    borderRadius: '12px',
                    zIndex: 0,
                    bgcolor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  },
                }}
              >
                <Tab
                  value="student"
                  label="🎓 Student"
                  sx={{
                    fontWeight: 800,
                    zIndex: 1,
                    color: role === 'student' ? 'white !important' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.9rem',
                  }}
                />
                <Tab
                  value="teacher"
                  label="👩‍🏫 Teacher"
                  sx={{
                    fontWeight: 800,
                    zIndex: 1,
                    color: role === 'teacher' ? 'white !important' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.9rem',
                  }}
                />
              </Tabs>
            </Paper>

            {/* Error Alert */}
            <Collapse in={!!error}>
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  mb: 2,
                  borderRadius: '12px',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                  color: '#FCA5A5',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  '& .MuiAlert-icon': { color: '#EF4444' },
                }}
              >
                {error}
              </Alert>
            </Collapse>

            {/* Success Animation */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6 }}
                    >
                      <CheckCircle sx={{ fontSize: 64, color: '#10B981' }} />
                    </motion.div>
                    <Typography
                      variant="h6"
                      sx={{ color: '#10B981', fontWeight: 800, mt: 2 }}
                    >
                      Sign-in successful!
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}
                    >
                      Redirecting...
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign In Buttons */}
            {!success && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Google Sign-In */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    startIcon={
                      isSigningIn ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        <Google />
                      )
                    }
                    sx={{
                      py: 2,
                      fontSize: '1rem',
                      fontWeight: 800,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)',
                        boxShadow: '0 12px 32px rgba(37, 99, 235, 0.4)',
                      },
                    }}
                  >
                    {isSigningIn ? 'Signing in...' : `Continue as ${role === 'student' ? 'Student' : 'Teacher'}`}
                  </Button>
                </motion.div>

                {/* Domain notice */}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.35)',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Only @paruluniversity.ac.in emails are accepted
                </Typography>

                {/* Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.08)' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    OR
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.08)' }} />
                </Box>

                {/* Demo mode */}
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleDemoLogin}
                  sx={{
                    py: 1.5,
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                    borderRadius: '16px',
                    fontWeight: 700,
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.2)',
                      bgcolor: 'rgba(255,255,255,0.03)',
                    },
                  }}
                >
                  🧪 Try Demo Mode
                </Button>
              </Box>
            )}
          </Paper>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.25)',
              mt: 3,
              fontWeight: 600,
            }}
          >
            Classtifier v2.0 • Parul University
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
