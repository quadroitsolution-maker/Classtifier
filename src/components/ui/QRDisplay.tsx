// src/components/ui/QRDisplay.tsx
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Box, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { CountdownRing } from './CountdownRing';

interface QRDisplayProps {
  /** Full token string to encode */
  token: string;
  /** Total seconds the QR is valid (e.g., 300) */
  ttlSeconds: number;
  /** Callback when timer expires */
  onExpire: () => void;
  /** Optional handler to close the view */
  onClose?: () => void;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({ token, ttlSeconds, onExpire, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // render QR when token changes
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, token, {
        width: 280,
        margin: 1,
        color: {
          dark: '#111111',
          light: '#ffffff00', // transparent background
        },
      }).catch(console.error);
    }
  }, [token]);

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
        gap: 4,
        p: 2,
      }}
    >
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'background.paper' }}
        >
          <Close />
        </IconButton>
      )}

      <canvas ref={canvasRef} />
      <CountdownRing totalSeconds={ttlSeconds} onExpire={onExpire} />
      <Typography variant="caption" color="text.secondary">Valid for {ttlSeconds} seconds</Typography>
    </Box>
  );
};
