import React from 'react';
import { 
  Box, Typography, Paper, Stack, Chip, 
  Avatar, IconButton, Button, Card, CardContent 
} from '@mui/material';
import { 
  PushPin, MoreHoriz, AttachFile, 
  FileDownload, AccessTime, School 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Announcement } from '../../types';

interface AnnouncementFeedProps {
  announcements: Announcement[];
}

export const AnnouncementFeed: React.FC<AnnouncementFeedProps> = ({ announcements }) => {
  if (announcements.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
        <Typography variant="body1">No announcements yet</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {announcements.map((announcement, idx) => (
        <motion.div
          key={announcement.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 6, 
              border: '1px solid',
              borderColor: announcement.priority === 'urgent' ? 'error.soft' : 'divider',
              bgcolor: announcement.priority === 'urgent' ? 'error.soft' : 'background.paper',
              position: 'relative',
              overflow: 'visible',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            {announcement.priority === 'urgent' && (
              <Chip 
                label="URGENT" 
                size="small" 
                color="error"
                sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  left: 20, 
                  fontWeight: 900,
                  fontSize: '0.6rem'
                }} 
              />
            )}
            
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                    {announcement.teacherName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {announcement.teacherName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.6 }}>
                      <School sx={{ fontSize: '0.8rem' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {announcement.className}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </Typography>
                  <IconButton size="small"><MoreHoriz /></IconButton>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                {announcement.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                {announcement.body}
              </Typography>

              {announcement.attachments && announcement.attachments.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {announcement.attachments.map((file) => (
                    <Button
                      key={file.id}
                      variant="outlined"
                      size="small"
                      startIcon={<AttachFile />}
                      endIcon={<FileDownload />}
                      sx={{ 
                        borderRadius: 3, 
                        textTransform: 'none',
                        borderColor: 'divider',
                        color: 'text.primary',
                        fontWeight: 700,
                        fontSize: '0.7rem'
                      }}
                    >
                      {file.name}
                    </Button>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Stack>
  );
};
