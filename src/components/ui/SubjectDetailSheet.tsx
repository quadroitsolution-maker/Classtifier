import React from 'react';
import { 
  Box, 
  Typography, 
  Drawer, 
  Stack, 
  Button, 
  Avatar, 
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import { 
  Close, 
  CalendarMonth, 
  LocationOn, 
  Person, 
  AccessTime,
  TrendingUp
} from '@mui/icons-material';
import { Course } from '../../types';
import { motion } from 'framer-motion';

interface SubjectDetailSheetProps {
  course: Course | null;
  open: boolean;
  onClose: () => void;
}

const SubjectDetailSheet: React.FC<SubjectDetailSheetProps> = ({ course, open, onClose }) => {
  if (!course) return null;

  const handleAddToCalendar = () => {
    // Basic Google Calendar link generation
    const title = encodeURIComponent(course.name);
    const location = encodeURIComponent(course.location);
    const details = encodeURIComponent(`Instructor: ${course.instructor}`);
    // Note: In a real app, you'd calculate the actual date
    const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`;
    window.open(gCalUrl, '_blank');
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          maxHeight: '90vh',
          p: 3,
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: 'divider', borderRadius: 2 }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: course.color, letterSpacing: '0.1em' }}>
              {course.code} • {course.type.toUpperCase()}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
              {course.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ bgcolor: 'action.hover' }}>
            <Close />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <Box sx={{ p: 2.5, bgcolor: 'background.default', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={course.facultyImage} 
              sx={{ width: 56, height: 56, bgcolor: course.color }}
            >
              {course.instructor?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {course.instructor}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Lead Faculty
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1, p: 2, bgcolor: 'background.default', borderRadius: 5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <LocationOn sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>ROOM</Typography>
              </Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{course.location}</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, bgcolor: 'background.default', borderRadius: 5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TrendingUp sx={{ fontSize: '1.2rem', color: 'success.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>ATTENDANCE</Typography>
              </Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'success.main' }}>
                {course.attendance || 0}%
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 5, border: '1px solid', borderColor: 'primary.100' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, display: 'block' }}>
              NEXT CLASS
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {course.nextClass?.time || 'No upcoming sessions'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
               {course.nextClass?.location}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<CalendarMonth />}
            onClick={handleAddToCalendar}
            sx={{
              py: 2,
              borderRadius: 4,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)'
            }}
          >
            Add to Calendar
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default SubjectDetailSheet;
