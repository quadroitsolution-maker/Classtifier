import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Button, Stack, LinearProgress, Avatar } from '@mui/material';
import { AccessTime, Science, AssignmentTurnedIn, SupervisorAccount, KeyboardArrowRight } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LabSession } from '../types';
import LabDetailSheet from '../components/ui/LabDetailSheet';

const LabDashboard: React.FC = () => {
  const [selectedLab, setSelectedLab] = useState<LabSession | null>(null);
  const [labs, setLabs] = useState<LabSession[]>([]);

  useEffect(() => {
    // Mocking lab data with teal theme identity
    const mockLabs: LabSession[] = [
      {
        id: 'lab-101',
        name: 'Advanced Chemistry Lab',
        code: 'CHM302',
        type: 'Lab',
        startTime: '14:00',
        endTime: '17:00',
        location: 'West Wing, Room 402',
        instructor: 'Dr. Sarah Jenkins',
        color: '#14B8A6', // Teal
        supervisor: 'John Doe',
        roomMapUrl: 'https://placehold.co/600x400/14B8A6/white?text=Chemistry+Lab+Map',
        instructionsUrl: '#',
        preLabReading: 'Read Chapter 4 on Acid-Base Titration before the session.',
        equipment: [
          { id: 'e1', name: 'Safety Goggles', required: true },
          { id: 'e2', name: 'Lab Coat', required: true },
          { id: 'e3', name: 'Burette', required: true },
          { id: 'e4', name: 'Beaker (250ml)', required: false }
        ]
      },
      {
        id: 'lab-102',
        name: 'Physics: Wave Mechanics',
        code: 'PHY205',
        type: 'Lab',
        startTime: '10:00',
        endTime: '13:00',
        location: 'Science Block, Lab 3',
        instructor: 'Prof. Michael Brown',
        color: '#0D9488', // Darker Teal
        supervisor: 'Jane Smith',
        roomMapUrl: 'https://placehold.co/600x400/0D9488/white?text=Physics+Lab+Map',
        instructionsUrl: '#',
        preLabReading: 'Review the formulas for wave velocity and frequency.',
        equipment: [
          { id: 'e1', name: 'Oscilloscope', required: true },
          { id: 'e2', name: 'Signal Generator', required: true },
          { id: 'e3', name: 'Connecting Wires', required: true }
        ]
      }
    ];
    setLabs(mockLabs);
  }, []);

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'teal', mb: 1 }}>
          Lab Central
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your experiments and technical sessions
        </Typography>
      </Box>

      {/* Countdown Card */}
      <Card sx={{ 
        mb: 4, 
        bgcolor: 'teal', 
        color: 'white', 
        borderRadius: 8,
        boxShadow: '0 12px 24px rgba(20, 184, 166, 0.2)'
      }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Science sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Next Lab Session</Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>01:45:22</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>Countdown to Advanced Chemistry Lab</Typography>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>Upcoming Labs</Typography>
      <Stack spacing={2.5}>
        {labs.map((lab, idx) => (
          <motion.div
            key={lab.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              sx={{ 
                borderRadius: 6, 
                border: '1px solid', 
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.03)' }
              }}
              onClick={() => setSelectedLab(lab)}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 3, 
                      bgcolor: 'teal', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Science />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{lab.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{lab.code}</Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label="Active" 
                    size="small" 
                    sx={{ bgcolor: 'rgba(20, 184, 166, 0.1)', color: 'teal', fontWeight: 800 }} 
                  />
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: '1rem', color: 'teal' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{lab.startTime} - {lab.endTime}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SupervisorAccount sx={{ fontSize: '1rem', color: 'teal' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{lab.supervisor}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentTurnedIn sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Checklist: 0/{lab.equipment.length}
                    </Typography>
                  </Box>
                  <Button size="small" endIcon={<KeyboardArrowRight />} sx={{ color: 'teal', fontWeight: 700 }}>
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stack>

      <LabDetailSheet 
        lab={selectedLab} 
        open={!!selectedLab} 
        onClose={() => setSelectedLab(null)} 
      />
    </Box>
  );
};

export default LabDashboard;
