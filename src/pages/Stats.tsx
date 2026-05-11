import React from 'react';
import {
  Box, Typography, Card, CardContent, Stack, LinearProgress,
  Chip, Paper, Button, CircularProgress, Collapse, Tabs, Tab,
  IconButton,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, TrendingFlat, CheckCircle, Cancel,
  AutoAwesome, Shield, Warning, ExpandMore, ExpandLess,
  School, Timeline, LocalFireDepartment,
} from '@mui/icons-material';
import AttendanceWidget from '../components/ui/AttendanceWidget';
import { MOCK_ATTENDANCE } from '../constants/mockData';
import {
  assessOverallRisk, assessCourseRisk, getRiskColor,
  getRiskLabel, RiskAssessment, OverallRisk, RiskLevel,
} from '../services/riskService';
import { generateRecoveryPlan } from '../services/riskNotificationService';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

type FilterTab = 'all' | 'critical' | 'warning' | 'safe';

const Stats: React.FC = () => {
  const { user } = useAppStore();
  const [overallRisk, setOverallRisk] = React.useState<OverallRisk | null>(null);
  const [courseAssessments, setCourseAssessments] = React.useState<RiskAssessment[]>([]);
  const [filter, setFilter] = React.useState<FilterTab>('all');
  const [expandedCourse, setExpandedCourse] = React.useState<string | null>(null);
  const [recoveryPlans, setRecoveryPlans] = React.useState<Record<string, string>>({});
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  // Calculate on mount
  React.useEffect(() => {
    const risk = assessOverallRisk(MOCK_ATTENDANCE);
    setOverallRisk(risk);
    const assessments = MOCK_ATTENDANCE.map(assessCourseRisk);
    setCourseAssessments(assessments);
  }, []);

  // Generate AI recovery plan
  const handleGeneratePlan = async (assessment: RiskAssessment) => {
    if (recoveryPlans[assessment.courseId]) return; // Already generated
    setLoadingPlan(assessment.courseId);
    const plan = await generateRecoveryPlan(user?.name || 'Student', assessment);
    setRecoveryPlans(prev => ({ ...prev, [assessment.courseId]: plan }));
    setLoadingPlan(null);
  };

  // Toggle expanded course
  const toggleExpand = (courseId: string, assessment: RiskAssessment) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      if (assessment.riskLevel !== 'safe') {
        handleGeneratePlan(assessment);
      }
    }
  };

  // Filter courses
  const filteredCourses = courseAssessments.filter(a => {
    if (filter === 'all') return true;
    return a.riskLevel === filter;
  });

  // Totals
  const totalAttended = MOCK_ATTENDANCE.reduce((s, c) => s + c.attended, 0);
  const totalClasses = MOCK_ATTENDANCE.reduce((s, c) => s + c.total, 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp sx={{ color: '#10B981', fontSize: 16 }} />;
      case 'declining': return <TrendingDown sx={{ color: '#EF4444', fontSize: 16 }} />;
      default: return <TrendingFlat sx={{ color: '#F59E0B', fontSize: 16 }} />;
    }
  };

  if (!overallRisk) return null;

  return (
    <Box>
      {/* ===== HEADER ===== */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Attendance Tracker</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Semester analytics & risk assessment
          </Typography>
        </Box>
        <Chip
          icon={<Shield sx={{ fontSize: 14 }} />}
          label={getRiskLabel(overallRisk.overallLevel)}
          size="small"
          sx={{
            bgcolor: `${getRiskColor(overallRisk.overallLevel)}18`,
            color: getRiskColor(overallRisk.overallLevel),
            fontWeight: 800,
            border: `1px solid ${getRiskColor(overallRisk.overallLevel)}30`,
          }}
        />
      </Box>

      {/* ===== OVERALL ATTENDANCE HERO ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 50%, #0F172A 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Circular gauge + stats */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {/* Main gauge */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <AttendanceWidget percentage={overallPercentage} label="OVERALL" color="#A78BFA" size={130} />
              </Box>

              {/* Stats grid */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.08em', mb: 1.5, display: 'block' }}>
                  SEMESTER SUMMARY
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'white' }}>{totalClasses}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Total</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#10B981' }}>{totalAttended}</Typography>
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>Present</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(239,68,68,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#EF4444' }}>{totalClasses - totalAttended}</Typography>
                    <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700 }}>Absent</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(99,102,241,0.1)', borderRadius: '12px', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#6366F1' }}>{MOCK_ATTENDANCE.length}</Typography>
                    <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 700 }}>Subjects</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== RISK SUMMARY BAR ===== */}
      {overallRisk.overallLevel !== 'safe' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: '16px',
              background: overallRisk.overallLevel === 'critical'
                ? 'linear-gradient(135deg, rgba(127,29,29,0.6), rgba(153,27,27,0.4))'
                : 'linear-gradient(135deg, rgba(120,53,15,0.5), rgba(146,64,14,0.3))',
              border: `1px solid ${overallRisk.overallLevel === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px',
                bgcolor: overallRisk.overallLevel === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {overallRisk.overallLevel === 'critical' 
                  ? <LocalFireDepartment sx={{ color: '#FCA5A5', fontSize: 20 }} />
                  : <Warning sx={{ color: '#FCD34D', fontSize: 20 }} />}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800, fontSize: '0.8rem' }}>
                  {overallRisk.criticalCourses > 0 ? `${overallRisk.criticalCourses} Critical` : ''} 
                  {overallRisk.criticalCourses > 0 && overallRisk.warningCourses > 0 ? ' • ' : ''}
                  {overallRisk.warningCourses > 0 ? `${overallRisk.warningCourses} Warning` : ''}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {overallRisk.urgentAction}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{
                color: getRiskColor(overallRisk.overallLevel),
                fontWeight: 800,
                bgcolor: 'rgba(0,0,0,0.2)',
                px: 1.5, py: 0.5, borderRadius: '8px',
              }}>
                Score: {overallRisk.overallScore}
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* ===== FILTER TABS ===== */}
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          mb: 3,
          borderRadius: '14px',
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          variant="fullWidth"
          sx={{
            minHeight: 38,
            '& .MuiTabs-indicator': {
              height: '100%',
              borderRadius: '10px',
              zIndex: 0,
              bgcolor: 'primary.main',
              opacity: 0.15,
            },
            '& .MuiTab-root': {
              minHeight: 38,
              fontWeight: 800,
              fontSize: '0.7rem',
              zIndex: 1,
              textTransform: 'none',
            },
          }}
        >
          <Tab value="all" label={`All (${courseAssessments.length})`} />
          <Tab
            value="critical"
            label={`🚨 Critical (${overallRisk.criticalCourses})`}
            sx={{ color: overallRisk.criticalCourses > 0 ? '#EF4444' : undefined }}
          />
          <Tab
            value="warning"
            label={`⚠️ Warning (${overallRisk.warningCourses})`}
            sx={{ color: overallRisk.warningCourses > 0 ? '#F59E0B' : undefined }}
          />
          <Tab
            value="safe"
            label={`✅ Safe (${overallRisk.safeCourses})`}
            sx={{ color: overallRisk.safeCourses > 0 ? '#10B981' : undefined }}
          />
        </Tabs>
      </Paper>

      {/* ===== SUBJECT CARDS ===== */}
      <AnimatePresence mode="wait">
        <motion.div key={filter} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <Stack spacing={2} sx={{ mb: 4 }}>
            {filteredCourses.length === 0 && (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {filter === 'critical' ? '🎉 No critical subjects! Keep it up!' :
                   filter === 'warning' ? '✅ No subjects in warning zone!' :
                   'No subjects found.'}
                </Typography>
              </Paper>
            )}

            {filteredCourses
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((assessment, idx) => {
              const isExpanded = expandedCourse === assessment.courseId;
              const riskColor = getRiskColor(assessment.riskLevel);

              return (
                <motion.div
                  key={assessment.courseId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isExpanded ? `${riskColor}40` : 'divider',
                      borderLeft: `4px solid ${riskColor}`,
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      ...(isExpanded && {
                        boxShadow: `0 4px 20px ${riskColor}15`,
                      }),
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Main row — clickable */}
                      <Box
                        onClick={() => toggleExpand(assessment.courseId, assessment)}
                        sx={{
                          p: 2.5,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                          transition: 'background 0.2s',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                                {assessment.courseName}
                              </Typography>
                              <Chip
                                label={getRiskLabel(assessment.riskLevel)}
                                size="small"
                                sx={{
                                  height: 20,
                                  bgcolor: `${riskColor}15`,
                                  color: riskColor,
                                  fontWeight: 800,
                                  fontSize: '0.6rem',
                                }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {getTrendIcon(assessment.prediction.trend)}
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {assessment.prediction.trend} • {assessment.attended}/{assessment.total} attended
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: riskColor, lineHeight: 1 }}>
                              {assessment.currentPercentage}%
                            </Typography>
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Progress bar */}
                        <Box sx={{ mt: 1.5, position: 'relative' }}>
                          <LinearProgress
                            variant="determinate"
                            value={assessment.currentPercentage}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'rgba(0,0,0,0.06)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: riskColor,
                                borderRadius: 4,
                                transition: 'width 1s ease-out',
                              },
                            }}
                          />
                          {/* 75% marker */}
                          <Box
                            sx={{
                              position: 'absolute',
                              left: '75%',
                              top: -2,
                              width: 2,
                              height: 12,
                              bgcolor: 'text.secondary',
                              opacity: 0.3,
                              borderRadius: 1,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              left: '75%',
                              top: 12,
                              transform: 'translateX(-50%)',
                              color: 'text.secondary',
                              fontSize: '0.55rem',
                              fontWeight: 700,
                              opacity: 0.5,
                            }}
                          >
                            75%
                          </Typography>
                        </Box>
                      </Box>

                      {/* ===== EXPANDED DETAILS ===== */}
                      <Collapse in={isExpanded}>
                        <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5 }}>
                          {/* Key metrics */}
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <MetricBox
                              label="Need"
                              value={`${assessment.classesNeeded}`}
                              unit="classes"
                              color="#2563EB"
                            />
                            <MetricBox
                              label="Can Skip"
                              value={`${assessment.maxSkippable}`}
                              unit="classes"
                              color={assessment.maxSkippable > 3 ? '#10B981' : '#EF4444'}
                            />
                            <MetricBox
                              label="Required"
                              value={`${assessment.requiredFutureAttendance}%`}
                              unit="going fwd"
                              color={assessment.requiredFutureAttendance > 90 ? '#EF4444' : '#F59E0B'}
                            />
                          </Box>

                          {/* Prediction row */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: '12px',
                              bgcolor: 'rgba(99,102,241,0.04)',
                              border: '1px solid rgba(99,102,241,0.1)',
                              mb: 2,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <Timeline sx={{ fontSize: 14, color: '#6366F1' }} />
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#6366F1' }}>
                                SEMESTER PREDICTION
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Best Case</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10B981' }}>
                                  {assessment.prediction.bestCase}%
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Projected</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: riskColor }}>
                                  {assessment.prediction.worstCase}%
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Recovery</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: assessment.recoverable ? '#10B981' : '#EF4444' }}>
                                  {assessment.recoverable ? '✅ Yes' : '❌ No'}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Weeks</Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  {assessment.prediction.weeksToRecover}w
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>

                          {/* AI Recovery Plan */}
                          {assessment.riskLevel !== 'safe' && (
                            <>
                              {!recoveryPlans[assessment.courseId] && loadingPlan !== assessment.courseId && (
                                <Button
                                  fullWidth
                                  size="small"
                                  startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
                                  onClick={() => handleGeneratePlan(assessment)}
                                  sx={{
                                    py: 1,
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    bgcolor: `${riskColor}10`,
                                    color: riskColor,
                                    border: `1px solid ${riskColor}20`,
                                    '&:hover': { bgcolor: `${riskColor}20` },
                                  }}
                                >
                                  Generate AI Recovery Plan
                                </Button>
                              )}

                              {loadingPlan === assessment.courseId && (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2 }}>
                                  <CircularProgress size={16} sx={{ color: riskColor }} />
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: riskColor }}>
                                    Generating AI plan...
                                  </Typography>
                                </Box>
                              )}

                              {recoveryPlans[assessment.courseId] && (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    bgcolor: 'rgba(37,99,235,0.04)',
                                    border: '1px solid rgba(37,99,235,0.1)',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                    <AutoAwesome sx={{ color: '#2563EB', fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800 }}>
                                      AI RECOVERY PLAN
                                    </Typography>
                                  </Box>
                                  <Box sx={{
                                    '& p': { margin: '4px 0', fontSize: '0.8rem', lineHeight: 1.6 },
                                    '& li': { fontSize: '0.8rem', lineHeight: 1.7 },
                                    '& h3': { fontSize: '0.85rem', fontWeight: 800, mt: 1 },
                                    '& strong': { fontWeight: 800 },
                                  }}>
                                    <ReactMarkdown>{recoveryPlans[assessment.courseId]}</ReactMarkdown>
                                  </Box>
                                </Paper>
                              )}
                            </>
                          )}

                          {/* Safe subject note */}
                          {assessment.riskLevel === 'safe' && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: '12px',
                                bgcolor: 'rgba(16,185,129,0.05)',
                                border: '1px solid rgba(16,185,129,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981', fontSize: '0.8rem' }}>
                                On track! You can skip up to {assessment.maxSkippable} more classes and still stay above 75%.
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </Stack>
        </motion.div>
      </AnimatePresence>

      {/* ===== MINI ATTENDANCE RINGS ===== */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Quick Glance</Typography>
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(49,46,129,0.3), rgba(30,27,75,0.5))',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(courseAssessments.length, 3)}, 1fr)`,
            gap: 2,
          }}>
            {courseAssessments.map((a) => (
              <Box key={a.courseId} sx={{ textAlign: 'center' }}>
                <AttendanceWidget
                  percentage={a.currentPercentage}
                  label={a.courseName.split(' ')[0].toUpperCase()}
                  color={getRiskColor(a.riskLevel)}
                  size={80}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// ===== REUSABLE METRIC BOX =====
const MetricBox: React.FC<{ label: string; value: string; unit: string; color: string }> = ({
  label, value, unit, color,
}) => (
  <Box sx={{
    flex: 1,
    p: 1.5,
    bgcolor: `${color}08`,
    borderRadius: '12px',
    textAlign: 'center',
    border: `1px solid ${color}10`,
  }}>
    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', fontSize: '0.6rem' }}>
      {label}
    </Typography>
    <Typography variant="subtitle2" sx={{ fontWeight: 900, color, lineHeight: 1.2 }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.55rem' }}>
      {unit}
    </Typography>
  </Box>
);

export default Stats;
