import React from 'react';
import { 
  Drawer, Box, Typography, IconButton, Stack, 
  Button, Divider, Chip, Avatar 
} from '@mui/material';
import { 
  Close, Map, PictureAsPdf, Person, 
  MenuBook, CheckBox, ErrorOutline 
} from '@mui/icons-material';
import { LabSession } from '../../types';
import EquipmentChecklist from './EquipmentChecklist';

interface LabDetailSheetProps {
  lab: LabSession | null;
  open: boolean;
  onClose: () => void;
}

const LabDetailSheet: React.FC<LabDetailSheetProps> = ({ lab, open, onClose }) => {
  if (!lab) return null;

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
          bgcolor: 'background.paper'
        }
      }}
    >
      <Box sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ 
          width: 40, 
          height: 4, 
          bgcolor: 'divider', 
          borderRadius: 2, 
          mx: 'auto', 
          mb: 2 
        }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'teal' }}>
              {lab.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {lab.location}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ bgcolor: 'background.default' }}>
            <Close />
          </IconButton>
        </Box>

        <Stack spacing={4} sx={{ pb: 4 }}>
          {/* Room Map Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Map sx={{ color: 'teal' }} /> Room Layout
            </Typography>
            <Box 
              component="img" 
              src={lab.roomMapUrl} 
              sx={{ 
                width: '100%', 
                borderRadius: 4, 
                border: '1px solid', 
                borderColor: 'divider',
                minHeight: 150,
                objectFit: 'cover'
              }} 
            />
          </Box>

          <Divider />

          {/* Supervisor & Resources */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                Supervisor
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'teal', fontSize: '0.7rem' }}>
                  {lab.supervisor.charAt(0)}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{lab.supervisor}</Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                Lab Manual
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<PictureAsPdf />} 
                fullWidth
                sx={{ mt: 0.5, borderRadius: 2, borderColor: 'teal', color: 'teal', textTransform: 'none', fontWeight: 700 }}
              >
                Download Instructions
              </Button>
            </Box>
          </Box>

          {/* Equipment Checklist */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckBox sx={{ color: 'teal' }} /> Equipment Checklist
            </Typography>
            <EquipmentChecklist labId={lab.id} equipment={lab.equipment} />
          </Box>

          {/* Pre-lab Reading */}
          <Box sx={{ bgcolor: 'rgba(20, 184, 166, 0.05)', p: 2.5, borderRadius: 4, border: '1px solid rgba(20, 184, 166, 0.1)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'teal' }}>
              <MenuBook fontSize="small" /> Pre-lab Reading
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              "{lab.preLabReading}"
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, color: 'orange' }}>
              <ErrorOutline fontSize="inherit" />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Mandatory for entry</Typography>
            </Box>
          </Box>

          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              borderRadius: 4, 
              py: 2, 
              bgcolor: 'teal', 
              fontWeight: 900,
              boxShadow: '0 8px 24px rgba(20, 184, 166, 0.3)',
              '&:hover': { bgcolor: 'teal' }
            }}
          >
            Start Attendance Scan
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default LabDetailSheet;
