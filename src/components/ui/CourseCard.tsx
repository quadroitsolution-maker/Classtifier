import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { AccessTime, LocationOn, Person } from '@mui/icons-material';
import { Course } from '../../types';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Card 
        onClick={onClick}
        elevation={0}
        sx={{ 
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 6,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: course.isCancelled ? 'rgba(0,0,0,0.02)' : 'background.paper',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          '&:hover': {
            borderColor: course.isCancelled ? 'divider' : 'primary.main',
            boxShadow: '0 8px 16px rgba(0,0,0,0.04)'
          }
        }}
      >
        {course.isCancelled && (
           <Box sx={{ 
             position: 'absolute', 
             top: 0, 
             left: 0, 
             right: 0, 
             bottom: 0, 
             bgcolor: 'rgba(255,255,255,0.4)', 
             zIndex: 1,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}>
             <Typography variant="h6" sx={{ fontWeight: 900, color: 'error.main', transform: 'rotate(-5deg)', border: '4px solid', borderColor: 'error.main', px: 2, py: 1, borderRadius: 2 }}>
               CANCELLED
             </Typography>
           </Box>
        )}

        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ borderLeft: `5px solid ${course.isCancelled ? '#CBD5E1' : course.color}`, pl: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 0.5, 
                    color: course.isCancelled ? 'text.disabled' : course.color, 
                    letterSpacing: '0.08em',
                    textDecoration: course.isCancelled ? 'line-through' : 'none'
                  }}
                >
                  {course.code}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 900, 
                    color: course.isCancelled ? 'text.disabled' : 'secondary.main', 
                    lineHeight: 1.2,
                    textDecoration: course.isCancelled ? 'line-through' : 'none'
                  }}
                >
                  {course.name}
                </Typography>
              </Box>
              <Chip 
                label={course.type} 
                size="small" 
                sx={{ 
                  height: 22,
                  bgcolor: course.isCancelled ? 'divider' : `${course.color}15`, 
                  color: course.isCancelled ? 'text.disabled' : course.color,
                  fontWeight: 800,
                  fontSize: '0.65rem'
                }} 
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {course.startTime} – {course.endTime}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                     {course.location}
                  </Typography>
                </Box>
              </Stack>

              {course.instructor && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Person sx={{ fontSize: '0.9rem', color: course.isCancelled ? 'text.disabled' : 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: course.isCancelled ? 'text.disabled' : 'primary.main' }}>
                    {course.instructor}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
