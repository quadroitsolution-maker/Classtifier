import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  Container,
  IconButton,
  Alert
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday } from 'date-fns';

// Components
import CourseCard from '../components/ui/CourseCard';
import ScheduleSkeleton from '../components/ui/ScheduleSkeleton';
import TimetableFilters from '../components/ui/TimetableFilters';
import SubjectDetailSheet from '../components/ui/SubjectDetailSheet';

// Hooks
import { useTimetable } from '../services/timetableService';
import { Course } from '../types';

const DAYS = [
  { label: 'Monday', short: 'Mon', value: 0 },
  { label: 'Tuesday', short: 'Tue', value: 1 },
  { label: 'Wednesday', short: 'Wed', value: 2 },
  { label: 'Thursday', short: 'Thu', value: 3 },
  { label: 'Friday', short: 'Fri', value: 4 },
];

const Schedule: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() - 1 || 0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { schedule, loading, error } = useTimetable(selectedDay);

  const filteredSchedule = useMemo(() => {
    if (!schedule) return [];
    let filtered = [...schedule];

    if (activeFilter === 'today') {
       // 'today' filter might be redundant with the day selector but we can handle it
    } else if (activeFilter === 'lecture') {
      filtered = filtered.filter(c => c.type === 'Lecture');
    } else if (activeFilter === 'lab') {
      filtered = filtered.filter(c => c.type === 'Lab');
    }

    return filtered;
  }, [schedule, activeFilter]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsSheetOpen(true);
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ mb: 4, px: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              Timetable
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {format(new Date(), 'EEEE, do MMMM')}
            </Typography>
          </Box>
          <IconButton sx={{ bgcolor: 'background.paper', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <FilterList />
          </IconButton>
        </Box>
      </Box>

      {/* Horizontal Day Selector */}
      <Box 
        sx={{ 
          mb: 4, 
          overflowX: 'auto', 
          display: 'flex', 
          gap: 2, 
          pb: 1,
          px: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {DAYS.map((day) => {
          const isActive = selectedDay === day.value;
          return (
            <motion.div
              key={day.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day.value)}
              style={{ cursor: 'pointer' }}
            >
              <Box
                sx={{
                  minWidth: 80,
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 5,
                  bgcolor: isActive ? 'primary.main' : 'background.paper',
                  color: isActive ? 'white' : 'text.primary',
                  boxShadow: isActive ? '0 8px 20px rgba(37, 99, 235, 0.2)' : 'none',
                  border: '1px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  transition: 'all 0.3s ease'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, opacity: isActive ? 0.8 : 0.6, display: 'block', mb: 0.5 }}>
                  {day.short}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {day.value + 10} {/* Mock date number */}
                </Typography>
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      margin: '4px auto 0'
                    }}
                  />
                )}
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* Filters */}
      <TimetableFilters 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
      />

      {/* Schedule List */}
      <Container maxWidth={false} disableGutters>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>
            {error}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScheduleSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {filteredSchedule.length > 0 ? (
                <Stack spacing={3}>
                  {filteredSchedule.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <CourseCard 
                        course={course} 
                        onClick={() => handleCourseClick(course)}
                      />
                    </motion.div>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>No classes scheduled</Typography>
                  <Typography variant="body2">Enjoy your free time!</Typography>
                </Box>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Detail Bottom Sheet */}
      <SubjectDetailSheet
        course={selectedCourse}
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </Box>
  );
};

export default Schedule;
