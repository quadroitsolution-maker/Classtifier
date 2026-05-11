// src/components/ui/AttendanceSuccessScreen.tsx
import React, { useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

/**
 * Shows a green check‑mark animation, confetti and updated attendance info.
 * Expects navigation state to contain the AttendanceResult.
 */
const AttendanceSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as any; // state.result
  const result = state?.result as any;

  // launch confetti once on mount
  useEffect(() => {
    if (result?.success) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    // auto‑return after 4 seconds
    const timer = setTimeout(() => navigate(-1), 4000);
    return () => clearTimeout(timer);
  }, [result, navigate]);

  const handleClose = () => navigate(-1);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 2,
      }}
    >
      <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'background.paper' }}>
        <CloseIcon />
      </IconButton>
      <Box sx={{ fontSize: 80, color: 'success.main' }}>✓</Box>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Attendance Marked!
      </Typography>
      {result?.subjectId && (
        <Typography variant="subtitle1">Subject: {result.subjectId}</Typography>
      )}
      {result?.updatedPercentage !== undefined && (
        <Typography variant="subtitle1">New Attendance: {result.updatedPercentage}%</Typography>
      )}
    </Box>
  );
};

export default AttendanceSuccessScreen;
