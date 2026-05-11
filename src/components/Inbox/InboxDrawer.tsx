import React from 'react';
import { Drawer, IconButton, Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Paper, Tooltip, Chip } from '@mui/material';
import { Close, MoreVert } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_NOTIFICATIONS } from '../../constants/mockData';
import './InboxDrawer.css';

interface InboxDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const InboxDrawer: React.FC<InboxDrawerProps> = ({ open, onClose }) => {
  const [tab, setTab] = React.useState<'all' | 'unread' | 'alerts' | 'grades'>('all');

  const filtered = MOCK_NOTIFICATIONS.filter((n) => {
    if (tab === 'unread') return !n.read;
    if (tab === 'alerts') return n.type === 'alert' || n.type === 'assignment';
    if (tab === 'grades') return n.type === 'grade';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'grade':
        return <Avatar sx={{ bgcolor: 'hsl(158, 71%, 52%)' }}>G</Avatar>;
      case 'assignment':
        return <Avatar sx={{ bgcolor: 'hsl(0, 78%, 62%)' }}>A</Avatar>;
      case 'alert':
        return <Avatar sx={{ bgcolor: 'hsl(41, 88%, 55%)' }}>!</Avatar>;
      default:
        return <Avatar sx={{ bgcolor: 'hsl(240, 70%, 55%)' }}>E</Avatar>;
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 380 }, bgcolor: 'background.paper' } }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Inbox
        </Typography>
        <IconButton onClick={onClose} aria-label="Close inbox">
          <Close />
        </IconButton>
      </Box>
      <Box sx={{ px: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['all', 'unread', 'alerts', 'grades'] as const).map((value) => (
            <Chip
              key={value}
              label={value.charAt(0).toUpperCase() + value.slice(1)}
              clickable
              color={tab === value ? 'primary' : 'default'}
              onClick={() => setTab(value)}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ overflowY: 'auto', flexGrow: 1, px: 2, pb: 2 }}>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Paper
                sx={{
                  bgcolor: n.read ? 'background.default' : 'rgba(99, 102, 241, 0.07)',
                  border: n.read ? '1px solid rgba(255,255,255,0.05)' : '1px solid hsl(240, 70%, 55%, 0.2)',
                  borderRadius: 2,
                  p: 1,
                  overflow: 'hidden',
                }}
              >
                <ListItem alignItems="flex-start" secondaryAction={
                  <Tooltip title="More actions">
                    <IconButton edge="end">
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                }>
                  <ListItemAvatar>{getIcon(n.type)}</ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pr: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {n.time}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                          {n.description}
                        </Typography>
                        {!n.read && (
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 800, mt: 1, display: 'inline-block' }}>
                            VIEW DETAILS
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            </motion.div>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
