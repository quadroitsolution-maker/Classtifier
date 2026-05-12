import React from 'react';
import {
  Box, Typography, Card, CardContent, Stack, LinearProgress,
  Chip, Button, Paper, CircularProgress, IconButton, Collapse,
} from '@mui/material';
import {
  ArrowBack, TrendingUp, TrendingDown, TrendingFlat,
  CheckCircle, Warning, Cancel, AutoAwesome, Refresh,
  Shield, Timeline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MOCK_ATTENDANCE } from '../constants/mockData';
import {
  assessOverallRisk, assessCourseRisk, getRiskColor,
  getRiskEmoji, getRiskLabel, RiskAssessment, OverallRisk,
} from '../services/riskService';
import { generateRecoveryPlan, generateDailyMotivation } from '../services/riskNotificationService';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const RecoveryPlan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [overallRisk, setOverallRisk] = React.useState<OverallRisk | null>(null);
  const [courseAssessments, setCourseAssessments] = React.useState<RiskAssessment[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<string | null>(null);
  const [recoveryPlan, setRecoveryPlan] = React.useState<string | null>(null);
  const [motivation, setMotivation] = React.useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = React.useState(false);
  const [loadingMotivation, setLoadingMotivation] = React.useState(false);

  // Calculate risk on mount
  React.useEffect(() => {
    const risk = assessOverallRisk(MOCK_ATTENDANCE);
    setOverallRisk(risk);
    const assessments = MOCK_ATTENDANCE.map(assessCourseRisk);
    setCourseAssessments(assessments);

    // Generate daily motivation
    const fetchMotivation = async () => {
      setLoadingMotivation(true);
      const msg = await generateDailyMotivation(user?.name || 'Student', risk.overallLevel);
      setMotivation(msg);
      setLoadingMotivation(false);
    };
    fetchMotivation();
  }, []);

  // Generate AI recovery plan for a course
  const handleGeneratePlan = async (assessment: RiskAssessment) => {
    setSelectedCourse(assessment.courseId);
    setLoadingPlan(true);
    setRecoveryPlan(null);
    const plan = await generateRecoveryPlan(user?.name || 'Student', assessment);
    setRecoveryPlan(plan);
    setLoadingPlan(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp sx={{ color: '#10B981', fontSize: 18 }} />;
      case 'declining': return <TrendingDown sx={{ color: '#EF4444', fontSize: 18 }} />;
      default: return <TrendingFlat sx={{ color: '#F59E0B', fontSize: 18 }} />;
    }
  };

  const getRecoveryIcon = (recoverable: boolean) => {
    return recoverable
      ? <CheckCircle sx={{ color: '#10B981', fontSize: 16 }} />
      : <Cancel sx={{ color: '#EF4444', fontSize: 16 }} />;
  };

  if (!overallRisk) return null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Recovery Plan</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            AI-powered attendance recovery
          </Typography>
        </Box>
      </Box>

      {/* Daily Motivation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #312E81, #1E1B4B)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AutoAwesome sx={{ color: '#A78BFA', fontSize: 18 }} />
            <Typography variant="caption" sx={{ color: '#A78BFA', fontWeight: 800 }}>
              AI DAILY MOTIVATION
            </Typography>
          </Box>
          {loadingMotivation ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={14} sx={{ color: '#A78BFA' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Generating...</Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {motivation}
            </Typography>
          )}
        </Paper>
      </motion.div>

      {/* Overall Risk Score */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '20px',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.05em' }}>
              RISK OVERVIEW
            </Typography>
            <Chip
              icon={<Shield sx={{ fontSize: 14 }} />}
              label={getRiskLabel(overallRisk.overallLevel)}
              size="small"
              sx={{
                bgcolor: `${getRiskColor(overallRisk.overallLevel)}15`,
                color: getRiskColor(overallRisk.overallLevel),
                fontWeight: 800,
                fontSize: '0.7rem',
              }}
            />
          </Box>

          {/* Risk Score Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Risk Score</Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: getRiskColor(overallRisk.overallLevel) }}>
                {overallRisk.overallScore}/100
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={overallRisk.overallScore}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getRiskColor(overallRisk.overallLevel),
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Stats Grid */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: '#10B98115', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#10B981' }}>{overallRisk.safeCourses}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#10B981' }}>Safe</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: '#F59E0B15', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#F59E0B' }}>{overallRisk.warningCourses}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#F59E0B' }}>Warning</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', p: 1.5, bgcolor: '#EF444415', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#EF4444' }}>{overallRisk.criticalCourses}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#EF4444' }}>Critical</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Course-wise Risk Assessment */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Subject Analysis</Typography>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {courseAssessments
          .sort((a, b) => b.riskScore - a.riskScore)
          .map((assessment, idx) => (
          <motion.div
            key={assessment.courseId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
                borderLeft: `4px solid ${getRiskColor(assessment.riskLevel)}`,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Course Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {assessment.courseName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      {getTrendIcon(assessment.prediction.trend)}
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {assessment.prediction.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: getRiskColor(assessment.riskLevel) }}>
                      {assessment.currentPercentage}%
                    </Typography>
                    <Chip
                      label={getRiskLabel(assessment.riskLevel)}
                      size="small"
                      sx={{
                        bgcolor: `${getRiskColor(assessment.riskLevel)}15`,
                        color: getRiskColor(assessment.riskLevel),
                        fontWeight: 800,
                        fontSize: '0.6rem',
                        height: 20,
                      }}
                    />
                  </Box>
                </Box>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={assessment.currentPercentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.05)',
                    mb: 1.5,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getRiskColor(assessment.riskLevel),
                      borderRadius: 3,
                    },
                  }}
                />

                {/* Stats Row */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${assessment.attended}/${assessment.total} attended`}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: 'rgba(0,0,0,0.04)' }}
                  />
                  <Chip
                    label={`${assessment.classesRemaining} remaining`}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: 'rgba(0,0,0,0.04)' }}
                  />
                  <Chip
                    icon={getRecoveryIcon(assessment.recoverable)}
                    label={assessment.recoverable ? 'Recoverable' : 'Needs Help'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      bgcolor: assessment.recoverable ? '#10B98110' : '#EF444410',
                      color: assessment.recoverable ? '#10B981' : '#EF4444',
                    }}
                  />
                </Box>

                {/* Key Metrics */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Box sx={{ flex: 1, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      Need
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563EB' }}>
                      {assessment.classesNeeded} classes
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      Can Skip
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: assessment.maxSkippable > 3 ? '#10B981' : '#EF4444' }}>
                      {assessment.maxSkippable} classes
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
                      Projected
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: assessment.prediction.worstCase >= 75 ? '#10B981' : '#EF4444' }}>
                      {assessment.prediction.worstCase}%
                    </Typography>
                  </Box>
                </Box>

                {/* AI Recovery Plan Button */}
                {assessment.riskLevel !== 'safe' && (
                  <Button
                    fullWidth
                    size="small"
                    startIcon={selectedCourse === assessment.courseId && loadingPlan ? <CircularProgress size={14} /> : <AutoAwesome sx={{ fontSize: 16 }} />}
                    onClick={() => handleGeneratePlan(assessment)}
                    disabled={loadingPlan && selectedCourse === assessment.courseId}
                    sx={{
                      mt: 1,
                      py: 1,
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      bgcolor: `${getRiskColor(assessment.riskLevel)}10`,
                      color: getRiskColor(assessment.riskLevel),
                      border: `1px solid ${getRiskColor(assessment.riskLevel)}20`,
                      '&:hover': {
                        bgcolor: `${getRiskColor(assessment.riskLevel)}20`,
                      },
                    }}
                  >
                    {loadingPlan && selectedCourse === assessment.courseId ? 'Generating...' : 'Generate AI Recovery Plan'}
                  </Button>
                )}

                {/* AI Recovery Plan Content */}
                <Collapse in={selectedCourse === assessment.courseId && !!recoveryPlan}>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: 'rgba(37, 99, 235, 0.03)',
                      border: '1px solid rgba(37, 99, 235, 0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <AutoAwesome sx={{ color: '#2563EB', fontSize: 14 }} />
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800 }}>
                        AI RECOVERY PLAN
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      '& p': { margin: '4px 0', fontSize: '0.8rem', lineHeight: 1.5 },
                      '& li': { fontSize: '0.8rem', lineHeight: 1.6 },
                      '& h3': { fontSize: '0.9rem', fontWeight: 800, mt: 1 },
                    }}>
                      <ReactMarkdown>{recoveryPlan || ''}</ReactMarkdown>
                    </Box>
                  </Paper>
                </Collapse>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stack>

      {/* Prediction Summary */}
      <Card elevation={0} sx={{ mb: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Timeline sx={{ color: '#6366F1' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Semester Prediction</Typography>
          </Box>
          <Stack spacing={1.5}>
            {courseAssessments.map((a) => (
              <Box key={a.courseId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getRiskColor(a.riskLevel), flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, fontSize: '0.8rem' }}>{a.courseName}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  Best: {a.prediction.bestCase}%
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: getRiskColor(a.riskLevel) }}>
                  Projected: {a.prediction.worstCase}%
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecoveryPlan;
