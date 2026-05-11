import React from 'react';
import { Box, Typography, Avatar, Grid, Card, CardContent, IconButton, Button, Stack, Chip, Paper } from '@mui/material';
import { NotificationsNone, KeyboardArrowRight, SmartToy, CheckCircle, AccessTime, LocationOn } from '@mui/icons-material';
import { useAppStore } from '../store/useAppStore';
import CourseCard from '../components/ui/CourseCard';
import AttendanceWidget from '../components/ui/AttendanceWidget';
import RiskBanner from '../components/ui/RiskBanner';
import { MOCK_ATTENDANCE, MOCK_COURSE_HISTORY } from '../constants/mockData';
import { WEEKLY_SCHEDULE } from '../constants/timetable';
import { assessOverallRisk, OverallRisk } from '../services/riskService';
import { generateRiskNotification } from '../services/riskNotificationService';
import { motion } from 'framer-motion';
import { AnnouncementFeed } from '../components/ui/AnnouncementFeed';
import { Announcement } from '../types';

const StudentDashboard: React.FC = () => {
  const { user } = useAppStore();
  const [overallRisk, setOverallRisk] = React.useState<OverallRisk | null>(null);
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);

  // Fetch announcements
  React.useEffect(() => {
    fetch('http://localhost:5000/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error('Error fetching announcements:', err));
  }, []);

  // Calculate risk and generate AI notification on mount
[... lines 19-140 unchanged ...]
        </Stack>
      </Box>

      {/* Announcements Feed */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Announcements</Typography>
          <Button size="small">See All</Button>
        </Box>
        <AnnouncementFeed announcements={announcements} />
      </Box>

      {/* Course History Section */}
[... lines 142-207 unchanged ...]
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Course History</Typography>
          <Button size="small" endIcon={<KeyboardArrowRight />}>Show More</Button>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto', 
          pb: 2, 
          px: 0.5, 
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          {MOCK_COURSE_HISTORY.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card sx={{ 
                minWidth: 200, 
                flexShrink: 0, 
                borderRadius: 7, 
                border: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${course.color}15`, color: course.color, width: 36, height: 36 }}>
                      <CheckCircle sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Chip 
                      label={`Grade: ${course.grade}`} 
                      size="small" 
                      sx={{ 
                        fontWeight: 800, 
                        bgcolor: 'success.soft', 
                        color: 'success.main',
                        fontSize: '0.65rem'
                      }} 
                    />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.3, height: 40, overflow: 'hidden' }}>
                    {course.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Completed {course.completionDate}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
