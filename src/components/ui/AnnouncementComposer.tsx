import React, { useState, useRef } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, FormControlLabel, Switch, 
  Typography, IconButton, Stack, Chip, CircularProgress,
  Tooltip, Paper, InputAdornment
} from '@mui/material';
import { 
  Close, CloudUpload, Magic, Send, 
  AttachFile, Delete, AutoAwesome 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { improveAnnouncementTone } from '../../services/geminiService';
import { useAppStore } from '../../store/useAppStore';

interface AnnouncementComposerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (announcement: any) => void;
}

export const AnnouncementComposer: React.FC<AnnouncementComposerProps> = ({ open, onClose, onSuccess }) => {
  const { user } = useAppStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImproveTone = async () => {
    if (!body) return;
    setIsImproving(true);
    try {
      const improved = await improveAnnouncementTone(body);
      setBody(improved);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const announcement = {
      title,
      body,
      priority: isUrgent ? 'urgent' : 'high',
      teacherId: user?.id,
      teacherName: user?.name,
      classId: 'CS101', // Mock class ID
      className: 'Computer Science 101',
      attachments: attachments.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        type: f.type,
        size: f.size,
        url: URL.createObjectURL(f) // Mock URL
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });
      
      if (response.ok) {
        onSuccess(announcement);
        onClose();
        // Reset form
        setTitle('');
        setBody('');
        setAttachments([]);
        setIsUrgent(false);
      }
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 6, p: 1 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Create Announcement
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ border: 'none' }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Announcement Title"
            placeholder="e.g., Midterm Exam Schedule"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
          />

          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Details"
              placeholder="Write your announcement here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                    <Tooltip title="Improve Tone with AI">
                      <IconButton 
                        onClick={handleImproveTone} 
                        disabled={isImproving || !body}
                        sx={{ 
                          bgcolor: 'secondary.soft',
                          color: 'secondary.main',
                          '&:hover': { bgcolor: 'secondary.soft' }
                        }}
                      >
                        {isImproving ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Attachments</Typography>
            <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 4, 
                borderStyle: 'dashed', 
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: 'background.default',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Drag & drop or click to upload files
              </Typography>
            </Paper>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <AnimatePresence>
                {attachments.map((file, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Chip
                      label={file.name}
                      onDelete={() => removeAttachment(idx)}
                      icon={<AttachFile sx={{ fontSize: 16 }} />}
                      sx={{ borderRadius: 2 }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch 
                checked={isUrgent} 
                onChange={(e) => setIsUrgent(e.target.checked)}
                color="error"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700, color: isUrgent ? 'error.main' : 'text.primary' }}>
                Mark as Urgent Alert
              </Typography>
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700 }}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!title || !body}
          startIcon={<Send />}
          sx={{ 
            borderRadius: 4, 
            px: 4, 
            fontWeight: 800,
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
          }}
        >
          Post Announcement
        </Button>
      </DialogActions>
    </Dialog>
  );
};
