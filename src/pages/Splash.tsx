import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { onAuthStateChanged } from '../services/firebaseAuth';
import { getUserDoc } from '../services/firestoreService';

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingComplete, setFirebaseUser, setUserFromFirestore, setAuthInitialized, user } = useAppStore();
  const [phase, setPhase] = React.useState<'logo' | 'text' | 'tagline' | 'checking' | 'done'>('logo');

  // Animated splash sequence
  React.useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('text'), 600),
      setTimeout(() => setPhase('tagline'), 1200),
      setTimeout(() => setPhase('checking'), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Check auth state once we reach the checking phase
  React.useEffect(() => {
    if (phase !== 'checking') return;

    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setAuthInitialized(true);

      if (firebaseUser) {
        // User has existing session
        setFirebaseUser(firebaseUser);
        
        // Check if onboarding is complete
        const userDoc = await getUserDoc(firebaseUser.uid);
        if (userDoc) {
          setUserFromFirestore(userDoc);
          // Navigate to dashboard
          const dashPath = userDoc.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
          setTimeout(() => navigate(dashPath, { replace: true }), 500);
        } else {
          // Needs onboarding
          setTimeout(() => navigate('/onboarding', { replace: true }), 500);
        }
      } else if (isAuthenticated && onboardingComplete && user) {
        // Fallback: user authenticated via mock/local store
        const dashPath = user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
        setTimeout(() => navigate(dashPath, { replace: true }), 500);
      } else {
        // No session, go to login
        setTimeout(() => navigate('/login', { replace: true }), 800);
      }
    });

    return () => unsubscribe();
  }, [phase]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
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

      <Container maxWidth="sm" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <AnimatePresence>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                borderRadius: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 4,
                boxShadow: '0 20px 60px rgba(37, 99, 235, 0.4), 0 0 100px rgba(124, 58, 237, 0.2)',
                position: 'relative',
              }}
            >
              <Box className="splash-logo-ring" />
              <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', fontSize: '3rem' }}>
                C
              </Typography>
            </Box>
          </motion.div>

          {/* App Name */}
          {(phase === 'text' || phase === 'tagline' || phase === 'checking') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: 'white',
                  letterSpacing: '-0.04em',
                  mb: 1,
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                }}
              >
                Classtifier
              </Typography>
            </motion.div>
          )}

          {/* Tagline */}
          {(phase === 'tagline' || phase === 'checking') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mb: 4,
                }}
              >
                Smart Attendance. Smarter You.
              </Typography>
            </motion.div>
          )}

          {/* Loading indicator */}
          {phase === 'checking' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#2563EB',
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default Splash;
