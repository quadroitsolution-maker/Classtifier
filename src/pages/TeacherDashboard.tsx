import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Stack, Chip, IconButton, LinearProgress, Avatar, AvatarGroup, Paper } from '@mui/material';
import { Notifications, KeyboardArrowRight, Add, EventNote, People, BarChart } from '@mui/icons-material';
import { useAppStore } from '../store/useAppStore';
import CourseCard from '../components/ui/CourseCard';
import { WEEKLY_SCHEDULE } from '../constants/timetable';
import { motion } from 'framer-motion';
import { AnnouncementComposer } from '../components/ui/AnnouncementComposer';

const TeacherDashboard: React.FC = () => {
  const { user } = useAppStore();
  const [composerOpen, setComposerOpen] = React.useState(false);
  
  const currentDay = Math.max(0, Math.min(4, new Date().getDay() - 1));
[... lines 13-28 unchanged ...]
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
[... lines 32-149 unchanged ...]
      </Card>

      {/* FAB and Composer */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}
      >
        <Tooltip title="Create Announcement">
          <IconButton
            onClick={() => setComposerOpen(true)}
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              color: 'white',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <Add sx={{ fontSize: 32 }} />
          </IconButton>
        </Tooltip>
      </motion.div>

      <AnnouncementComposer 
        open={composerOpen} 
        onClose={() => setComposerOpen(false)} 
        onSuccess={(a) => console.log('Announcement posted:', a)}
      />
    </Box>
  );
};

export default TeacherDashboard;
