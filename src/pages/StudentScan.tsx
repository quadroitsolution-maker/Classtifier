import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { validateAttendance } from '../services/attendanceService';
import { AttendancePayload } from '../types';
import { AttendanceResult } from '../types';

/**
 * StudentScan – opens device camera, scans QR code, and submits attendance.
 * Shows a live video preview with a centered scanning overlay.
 */
const StudentScan: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Start camera on mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setScanning(true);
      } catch (e) {
        setError('Unable to access camera. Please allow permissions and try again.');
      }
    };
    startCamera();
    return () => {
      // cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, []);

  // Main scan loop – runs while scanning is true
  useEffect(() => {
    if (!scanning) return;
    let animationId: number;
    const ctx = canvasRef.current?.getContext('2d');
    const scan = () => {
      if (!videoRef.current || !canvasRef.current || !ctx) {
        animationId = requestAnimationFrame(scan);
        return;
      }
      const video = videoRef.current;
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width === 0 || height === 0) {
        animationId = requestAnimationFrame(scan);
        return;
      }
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, width, height);
      if (code) {
        // QR detected – stop scanning and process token
        setScanning(false);
        const token = code.data.trim();
        const payload: AttendancePayload = { studentId: 'student-001', token };
        // Call backend service
        validateAttendance(payload).then((result: AttendanceResult) => {
          if (result.success) {
            navigate('/attendance-success', { state: { result } });
          } else {
            setError(result.message || 'Attendance failed');
            // restart scanning after a short pause
            setTimeout(() => setScanning(true), 2000);
          }
        }).catch(() => {
          setError('Network error during attendance submission');
          setTimeout(() => setScanning(true), 2000);
        });
      } else {
        animationId = requestAnimationFrame(scan);
      }
    };
    animationId = requestAnimationFrame(scan);
    return () => cancelAnimationFrame(animationId);
  }, [scanning, navigate]);

  const handleClose = () => {
    setScanning(false);
    navigate(-1);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', bgcolor: 'background.default' }}>
      {error && (
        <Typography color="error" sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
          {error}
        </Typography>
      )}
      <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {scanning && (
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress color="primary" size={80} />
          <Typography variant="h6" sx={{ position: 'absolute', color: 'white' }}>Scanning…</Typography>
        </Box>
      )}
      <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'background.paper' }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default StudentScan;
