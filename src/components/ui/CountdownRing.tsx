// src/components/ui/CountdownRing.tsx
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Box, Typography } from '@mui/material';

interface CountdownRingProps {
  /** total duration in seconds */
  totalSeconds: number;
  /** optional callback when timer hits zero */
  onExpire?: () => void;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({ totalSeconds, onExpire }) => {
  const [remaining, setRemaining] = useState(totalSeconds);
  const controls = useAnimation();

  // tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // trigger animation when remaining changes
  useEffect(() => {
    const progress = (remaining / totalSeconds) * 100;
    controls.start({
      strokeDashoffset: `${progress}%`,
    });
    if (remaining === 0 && onExpire) {
      onExpire();
    }
  }, [remaining, totalSeconds, controls, onExpire]);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  // color transitions: green -> orange -> red
  const getColor = () => {
    if (remaining > totalSeconds * 0.6) return '#4caf50'; // green
    if (remaining > totalSeconds * 0.3) return '#ff9800'; // orange
    return '#f44336'; // red
  };

  return (
    <Box sx={{ position: 'relative', width: 120, height: 120 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {/* background circle */}
        <circle
          cx={60}
          cy={60}
          r={radius}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={8}
          fill="none"
        />
        {/* animated progress */}
        <motion.circle
          cx={60}
          cy={60}
          r={radius}
          stroke={getColor()}
          strokeWidth={8}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          initial={false}
          animate={controls}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" component="div" color="text.secondary">
          {remaining}s
        </Typography>
      </Box>
    </Box>
  );
};
