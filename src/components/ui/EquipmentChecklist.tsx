import React, { useState, useEffect } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, LinearProgress, Stack, Paper } from '@mui/material';
import { EquipmentItem } from '../../types';

interface EquipmentChecklistProps {
  labId: string;
  equipment: EquipmentItem[];
}

const EquipmentChecklist: React.FC<EquipmentChecklistProps> = ({ labId, equipment }) => {
  const storageKey = `lab_checklist_${labId}`;
  const [items, setItems] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(equipment.map(item => ({ ...item, checked: false })));
    }
  }, [labId, equipment]);

  const handleToggle = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const completedCount = items.filter(i => i.checked).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
            {completedCount}/{items.length} Ready
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'teal' }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 6, 
            borderRadius: 3, 
            bgcolor: 'rgba(20, 184, 166, 0.1)',
            '& .MuiLinearProgress-bar': { bgcolor: 'teal' }
          }} 
        />
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
          {items.map((item) => (
            <Box 
              key={item.id} 
              sx={{ 
                px: 2, 
                py: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: item.checked ? 'rgba(20, 184, 166, 0.02)' : 'transparent'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={item.checked} 
                    onChange={() => handleToggle(item.id)}
                    sx={{ color: 'teal', '&.Mui-checked': { color: 'teal' } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 700, textDecoration: item.checked ? 'line-through' : 'none', opacity: item.checked ? 0.6 : 1 }}>
                    {item.name}
                  </Typography>
                }
                sx={{ flexGrow: 1 }}
              />
              {item.required && !item.checked && (
                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800, fontSize: '0.6rem', border: '1px solid', borderColor: 'error.main', px: 1, borderRadius: 1 }}>
                  REQUIRED
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default EquipmentChecklist;
