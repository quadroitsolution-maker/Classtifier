// src/pages/TeacherQR.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { generateAttendanceToken } from '../services/attendanceService';
import { QRDisplay } from '../components/ui/QRDisplay';

/**
 * Simple demo teacher page that generates a signed QR token for a batch/subject.
 * In a real app you would let the teacher choose batch/subject via UI.
 */
const TeacherQR: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string>('');
  const ttl = 300; // 5 minutes

  // For demo we use static IDs – replace with real ids from your state/store.
  const batchId = 'batch-01';
  const subjectId = 'subj-01';

  const generate = async () => {
    const newToken = await generateAttendanceToken(batchId, subjectId);
    setToken(newToken);
  };

  // generate token on mount and when expiry triggers
  useEffect(() => {
    generate();
  }, []);

  const handleExpire = () => {
    // regenerate when the QR expires
    generate();
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', bgcolor: 'background.default' }}>
      <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'background.paper' }}>
        <CloseIcon />
      </IconButton>
      {token ? (
        <QRDisplay token={token} ttlSeconds={ttl} onExpire={handleExpire} />
      ) : (
        <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>Generating QR…</Typography>
      )}
    </Box>
  );
};

export default TeacherQR;
