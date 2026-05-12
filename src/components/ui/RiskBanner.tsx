import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { Warning, TrendingDown, ArrowForward, Shield } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { OverallRisk, getRiskColor, getRiskEmoji, getRiskLabel } from '../../services/riskService';
import { motion } from 'framer-motion';

interface RiskBannerProps {
  risk: OverallRisk;
  aiMessage?: string | null;
}

const RiskBanner: React.FC<RiskBannerProps> = ({ risk, aiMessage }) => {
  const navigate = useNavigate();

  if (risk.overallLevel === 'safe') return null;

  const isCritical = risk.overallLevel === 'critical';
  const bgGradient = isCritical
    ? 'linear-gradient(135deg, #7F1D1D, #991B1B, #B91C1C)'
    : 'linear-gradient(135deg, #78350F, #92400E, #B45309)';
  const borderColor = isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';
  const iconBg = isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: '20px',
          background: bgGradient,
          border: `1px solid ${borderColor}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isCritical
            ? '0 8px 32px rgba(239, 68, 68, 0.2)'
            : '0 8px 32px rgba(245, 158, 11, 0.15)',
        }}
      >
        {/* Animated pulse background */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 180,
            height: 180,
            borderRadius: '50%',
            bgcolor: isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
            filter: 'blur(40px)',
            animation: 'blobFloat1 4s ease-in-out infinite',
          }}
        />

        {/* Header Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isCritical ? (
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}>
                <Warning sx={{ color: '#FCA5A5', fontSize: 22 }} />
              </motion.div>
            ) : (
              <TrendingDown sx={{ color: '#FCD34D', fontSize: 22 }} />
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>
              {isCritical ? '🚨 Critical Attendance Alert' : '⚠️ Attendance Warning'}
            </Typography>
          </Box>
          <Chip
            label={`${risk.coursesAtRisk.length} at risk`}
            size="small"
            sx={{
              bgcolor: iconBg,
              color: 'white',
              fontWeight: 800,
              fontSize: '0.65rem',
              height: 24,
            }}
          />
        </Box>

        {/* AI Message or Summary */}
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 600,
            mb: 2,
            lineHeight: 1.5,
            fontSize: '0.82rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {aiMessage || risk.summary}
        </Typography>

        {/* At-risk subjects chips */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2, position: 'relative', zIndex: 1 }}>
          {risk.coursesAtRisk.map((course) => (
            <Chip
              key={course.courseId}
              label={`${course.courseName.split(' ')[0]} ${course.currentPercentage}%`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </Box>

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/recovery-plan')}
            sx={{
              py: 1.2,
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.85rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              position: 'relative',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
              },
            }}
          >
            View Recovery Plan
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default RiskBanner;
