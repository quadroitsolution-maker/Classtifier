import React from 'react';
import {
  Box, Typography, Button, Container, Paper, TextField,
  MenuItem, Stepper, Step, StepLabel, CircularProgress,
  Chip, Alert, Collapse,
} from '@mui/material';
import {
  School, CalendarMonth, Badge, Groups, CheckCircle, ArrowForward, ArrowBack, Notifications,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { createUserDoc, updateUserDoc } from '../services/firestoreService';
import { requestNotificationPermission } from '../services/fcmService';
import { motion, AnimatePresence } from 'framer-motion';

const DEPARTMENTS = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Pharmacy',
  'Architecture',
  'MBA',
  'BBA',
  'BCA',
  'MCA',
  'Law',
  'Arts & Humanities',
  'Commerce',
  'Science',
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const DIVISIONS = ['A', 'B', 'C', 'D', 'E'];

const BATCHES = ['Batch 1', 'Batch 2', 'Batch 3', 'Batch 4', 'Batch 5', 'Batch 6'];

const STEPS = ['Department', 'Semester', 'Student ID', 'Division'];

const stepIcons = [
  <School sx={{ fontSize: 28 }} />,
  <CalendarMonth sx={{ fontSize: 28 }} />,
  <Badge sx={{ fontSize: 28 }} />,
  <Groups sx={{ fontSize: 28 }} />,
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, firebaseUid, setOnboardingComplete, setUserFromFirestore } = useAppStore();
  const [activeStep, setActiveStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = React.useState(false);

  // Form state
  const [department, setDepartment] = React.useState('');
  const [semester, setSemester] = React.useState<number>(1);
  const [studentId, setStudentId] = React.useState('');
  const [division, setDivision] = React.useState('');
  const [batch, setBatch] = React.useState('');
  const [role, setRole] = React.useState<'student' | 'teacher'>('student');

  const canProceed = () => {
    switch (activeStep) {
      case 0: return !!department;
      case 1: return !!semester;
      case 2: return studentId.trim().length >= 3;
      case 3: return !!division && !!batch;
      default: return false;
    }
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!firebaseUid) {
      setError('Authentication error. Please sign in again.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userData = {
        uid: firebaseUid,
        name: user?.name || '',
        email: user?.email || '',
        role,
        avatar: user?.avatar || '',
        department,
        semester,
        studentId,
        division,
        batch,
        college: 'Parul University',
        onboardingComplete: true,
        fcmToken: '',
      };

      await createUserDoc(firebaseUid, userData);
      setUserFromFirestore(userData as any);
      setOnboardingComplete(true);

      // Show notification prompt
      setShowNotificationPrompt(true);
    } catch (err: any) {
      console.error('Error saving user data:', err);
      setError(err.message || 'Failed to save. Please try again.');
      setSaving(false);
    }
  };

  const handleNotificationChoice = async (allow: boolean) => {
    if (allow && firebaseUid) {
      await requestNotificationPermission(firebaseUid);
    }

    // Navigate to dashboard
    const dashPath = role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
    navigate(dashPath, { replace: true });
  };

  // Notification prompt screen
  if (showNotificationPrompt) {
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
        <Box className="gradient-blob blob-1" />
        <Box className="gradient-blob blob-2" />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, p: 3 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: '28px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
              }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 12px 32px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <Notifications sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </motion.div>

              <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mb: 1 }}>
                Stay Updated! 🔔
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, fontWeight: 600 }}
              >
                Get instant alerts for class cancellations, attendance updates, and grade releases.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleNotificationChoice(true)}
                  sx={{
                    py: 2,
                    borderRadius: '16px',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  Enable Notifications
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => handleNotificationChoice(false)}
                  sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}
                >
                  Maybe Later
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box className="gradient-blob blob-1" />
      <Box className="gradient-blob blob-2" />
      <Box className="gradient-blob blob-3" />

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          p: 3,
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mb: 1 }}>
              Set Up Your Profile ✨
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              {user?.name ? `Hey ${user.name.split(' ')[0]}! ` : ''}Let's personalize your experience
            </Typography>
          </Box>
        </motion.div>

        {/* Role Selection */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 3 }}>
          {(['student', 'teacher'] as const).map((r) => (
            <Chip
              key={r}
              label={r === 'student' ? '🎓 Student' : '👩‍🏫 Teacher'}
              onClick={() => setRole(r)}
              sx={{
                px: 2,
                py: 2.5,
                fontWeight: 800,
                fontSize: '0.9rem',
                bgcolor: role === r ? 'primary.main' : 'rgba(255,255,255,0.05)',
                color: role === r ? 'white' : 'rgba(255,255,255,0.5)',
                border: '1px solid',
                borderColor: role === r ? 'primary.main' : 'rgba(255,255,255,0.08)',
                '&:hover': {
                  bgcolor: role === r ? 'primary.dark' : 'rgba(255,255,255,0.08)',
                },
              }}
            />
          ))}
        </Box>

        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 4,
            '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.7rem' },
            '& .MuiStepLabel-label.Mui-active': { color: 'white' },
            '& .MuiStepLabel-label.Mui-completed': { color: '#10B981' },
            '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.1)' },
            '& .MuiStepIcon-root.Mui-active': { color: '#2563EB' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#10B981' },
            '& .MuiStepConnector-line': { borderColor: 'rgba(255,255,255,0.08)' },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error */}
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
            }}
          >
            {error}
          </Alert>
        </Collapse>

        {/* Step Content */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '28px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: 280,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step icon */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {stepIcons[activeStep]}
                </Box>
              </Box>

              {/* Step 0: Department */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1, textAlign: 'center' }}>
                    Select Your Department
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, textAlign: 'center' }}>
                    Choose the department you're enrolled in
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    label="Department"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.03)',
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
                      '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.4)' },
                    }}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}

              {/* Step 1: Semester */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1, textAlign: 'center' }}>
                    Select Semester
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, textAlign: 'center' }}>
                    Which semester are you currently in?
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
                    {SEMESTERS.map((sem) => (
                      <motion.div key={sem} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Paper
                          onClick={() => setSemester(sem)}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: '16px',
                            bgcolor: semester === sem ? 'primary.main' : 'rgba(255,255,255,0.03)',
                            color: semester === sem ? 'white' : 'rgba(255,255,255,0.6)',
                            border: '1px solid',
                            borderColor: semester === sem ? 'primary.main' : 'rgba(255,255,255,0.08)',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            transition: 'all 0.2s ease',
                            boxShadow: semester === sem ? '0 4px 16px rgba(37, 99, 235, 0.3)' : 'none',
                          }}
                        >
                          {sem}
                        </Paper>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Step 2: Student ID */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1, textAlign: 'center' }}>
                    Enter Your Student ID
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, textAlign: 'center' }}>
                    Your enrollment number or {role === 'teacher' ? 'staff' : 'student'} ID
                  </Typography>
                  <TextField
                    fullWidth
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="e.g., 230103107042"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.03)',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                      },
                      '& .MuiOutlinedInput-input': { textAlign: 'center' },
                    }}
                  />
                </Box>
              )}

              {/* Step 3: Division & Batch */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1, textAlign: 'center' }}>
                    Division & Batch
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, textAlign: 'center' }}>
                    Select your class division and lab batch
                  </Typography>

                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 1, display: 'block' }}>
                    DIVISION
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    {DIVISIONS.map((div) => (
                      <Chip
                        key={div}
                        label={div}
                        onClick={() => setDivision(div)}
                        sx={{
                          px: 2,
                          py: 2,
                          fontWeight: 800,
                          bgcolor: division === div ? 'primary.main' : 'rgba(255,255,255,0.05)',
                          color: division === div ? 'white' : 'rgba(255,255,255,0.5)',
                          border: '1px solid',
                          borderColor: division === div ? 'primary.main' : 'rgba(255,255,255,0.08)',
                          '&:hover': { bgcolor: division === div ? 'primary.dark' : 'rgba(255,255,255,0.08)' },
                        }}
                      />
                    ))}
                  </Box>

                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 1, display: 'block' }}>
                    BATCH
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {BATCHES.map((b) => (
                      <Chip
                        key={b}
                        label={b}
                        onClick={() => setBatch(b)}
                        sx={{
                          fontWeight: 700,
                          bgcolor: batch === b ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                          color: batch === b ? 'white' : 'rgba(255,255,255,0.5)',
                          border: '1px solid',
                          borderColor: batch === b ? '#7C3AED' : 'rgba(255,255,255,0.08)',
                          '&:hover': { bgcolor: batch === b ? '#6D28D9' : 'rgba(255,255,255,0.08)' },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        </Paper>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBack />}
            sx={{
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 700,
              visibility: activeStep === 0 ? 'hidden' : 'visible',
            }}
          >
            Back
          </Button>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              variant="contained"
              endIcon={
                saving ? (
                  <CircularProgress size={18} sx={{ color: 'white' }} />
                ) : activeStep === STEPS.length - 1 ? (
                  <CheckCircle />
                ) : (
                  <ArrowForward />
                )
              }
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                '&.Mui-disabled': {
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {saving ? 'Saving...' : activeStep === STEPS.length - 1 ? 'Complete Setup' : 'Next'}
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default Onboarding;
