import React from 'react';
import {
  Box, Typography, Paper, Chip, IconButton, Badge, Button,
  Tabs, Tab, Collapse, Divider, SwipeableDrawer,
} from '@mui/material';
import {
  NotificationsActive, DoneAll, Delete, AccessTime,
  KeyboardArrowRight, Close, Circle, FilterList,
  School, Warning, EmojiEvents, AutoAwesome, Campaign,
  MarkChatRead,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  SmartNotification, NotificationType, generateDemoNotifications,
  formatTimestamp, groupNotifications,
} from '../services/smartReminderService';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';

type FilterTab = 'all' | 'unread' | 'reminders' | 'alerts' | 'other';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<SmartNotification[]>([]);
  const [filter, setFilter] = React.useState<FilterTab>('all');
  const [deletingIds, setDeletingIds] = React.useState<Set<string>>(new Set());

  // Load notifications on mount
  React.useEffect(() => {
    const demo = generateDemoNotifications();
    setNotifications(demo);
  }, []);

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    if (deletingIds.has(n.id)) return false;
    switch (filter) {
      case 'unread': return !n.read;
      case 'reminders': return n.type === 'class_reminder';
      case 'alerts': return n.type === 'risk_alert';
      case 'other': return !['class_reminder', 'risk_alert'].includes(n.type);
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const grouped = groupNotifications(filteredNotifications);

  // Mark single as read
  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Mark all as read
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete notification with animation
  const deleteNotification = (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  // Handle notification tap
  const handleTap = (notif: SmartNotification) => {
    markRead(notif.id);
    if (notif.deepLink) navigate(notif.deepLink);
  };

  // Type icon mapping
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'class_reminder': return <School sx={{ fontSize: 18 }} />;
      case 'risk_alert': return <Warning sx={{ fontSize: 18 }} />;
      case 'achievement': return <EmojiEvents sx={{ fontSize: 18 }} />;
      case 'ai_tip': return <AutoAwesome sx={{ fontSize: 18 }} />;
      case 'system': return <Campaign sx={{ fontSize: 18 }} />;
      default: return <NotificationsActive sx={{ fontSize: 18 }} />;
    }
  };

  return (
    <Box>
      {/* ===== HEADER ===== */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>Inbox</Typography>
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              sx={{
                bgcolor: '#EF4444',
                color: 'white',
                fontWeight: 900,
                fontSize: '0.7rem',
                height: 22,
                minWidth: 22,
              }}
            />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<DoneAll sx={{ fontSize: 16 }} />}
            onClick={markAllRead}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'none',
              color: 'primary.main',
            }}
          >
            Mark all read
          </Button>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 2.5, display: 'block' }}>
        Smart reminders & attendance alerts
      </Typography>

      {/* ===== FILTER TABS ===== */}
      <Paper
        elevation={0}
        sx={{
          p: 0.5,
          mb: 3,
          borderRadius: '14px',
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            minHeight: 36,
            '& .MuiTabs-indicator': {
              height: '100%',
              borderRadius: '10px',
              zIndex: 0,
              bgcolor: 'primary.main',
              opacity: 0.12,
            },
            '& .MuiTab-root': {
              minHeight: 36,
              fontWeight: 800,
              fontSize: '0.68rem',
              zIndex: 1,
              textTransform: 'none',
              minWidth: 0,
              px: 1.5,
            },
          }}
        >
          <Tab value="all" label="All" />
          <Tab value="unread" label={`Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`} />
          <Tab value="reminders" label="📚 Classes" />
          <Tab value="alerts" label="🚨 Alerts" />
          <Tab value="other" label="✨ Other" />
        </Tabs>
      </Paper>

      {/* ===== NOTIFICATION LIST ===== */}
      {Object.keys(grouped).length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" sx={{ mb: 1 }}>📭</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {filter === 'unread' ? 'Great job staying on top of things.' : 'Smart reminders will appear here before your classes.'}
          </Typography>
        </Box>
      )}

      {Object.entries(grouped).map(([dateLabel, notifs]) => (
        <Box key={dateLabel} sx={{ mb: 3 }}>
          {/* Date Group Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.06em' }}>
              {dateLabel.toUpperCase()}
            </Typography>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {notifs.length}
            </Typography>
          </Box>

          {/* Notification Cards */}
          <AnimatePresence>
            {notifs.map((notif, idx) => (
              <SwipeableNotification
                key={notif.id}
                notification={notif}
                index={idx}
                onDelete={() => deleteNotification(notif.id)}
                onRead={() => markRead(notif.id)}
                onTap={() => handleTap(notif)}
                getTypeIcon={getTypeIcon}
              />
            ))}
          </AnimatePresence>
        </Box>
      ))}
    </Box>
  );
};

// ====================================
// SWIPEABLE NOTIFICATION CARD
// ====================================
interface SwipeableNotificationProps {
  notification: SmartNotification;
  index: number;
  onDelete: () => void;
  onRead: () => void;
  onTap: () => void;
  getTypeIcon: (type: NotificationType) => React.ReactNode;
}

const SwipeableNotification: React.FC<SwipeableNotificationProps> = ({
  notification, index, onDelete, onRead, onTap, getTypeIcon,
}) => {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-120, -60], [1, 0]);
  const readOpacity = useTransform(x, [60, 120], [0, 1]);
  const scale = useTransform(x, [-120, 0, 120], [0.95, 1, 0.95]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete();
    } else if (info.offset.x > 100) {
      onRead();
    }
  };

  const priorityBorder = {
    urgent: '2px solid rgba(239, 68, 68, 0.4)',
    high: '2px solid rgba(245, 158, 11, 0.3)',
    medium: '1px solid rgba(99, 102, 241, 0.15)',
    low: '1px solid rgba(255, 255, 255, 0.06)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -200, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      style={{ marginBottom: 8 }}
    >
      {/* Background actions */}
      <Box sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Delete bg (left swipe) */}
        <motion.div style={{ opacity: deleteOpacity }}>
          <Box sx={{
            position: 'absolute', inset: 0, borderRadius: '16px',
            bgcolor: 'rgba(239, 68, 68, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            px: 3,
          }}>
            <Delete sx={{ color: '#EF4444' }} />
          </Box>
        </motion.div>

        {/* Read bg (right swipe) */}
        <motion.div style={{ opacity: readOpacity }}>
          <Box sx={{
            position: 'absolute', inset: 0, borderRadius: '16px',
            bgcolor: 'rgba(16, 185, 129, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            px: 3,
          }}>
            <MarkChatRead sx={{ color: '#10B981' }} />
          </Box>
        </motion.div>

        {/* Card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          style={{ x, scale }}
        >
          <Paper
            onClick={onTap}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '16px',
              border: priorityBorder[notification.priority],
              bgcolor: notification.read ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.04)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              '&:active': { bgcolor: 'rgba(255,255,255,0.07)' },
            }}
          >
            {/* Unread indicator */}
            {!notification.read && (
              <Box sx={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0, width: 3,
                bgcolor: notification.color,
                borderRadius: '0 2px 2px 0',
              }} />
            )}

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              {/* Icon */}
              <Box sx={{
                width: 40, height: 40, borderRadius: '12px',
                bgcolor: `${notification.color}15`,
                border: `1px solid ${notification.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: notification.color,
                fontSize: '1.1rem',
                mt: 0.25,
              }}>
                {notification.icon}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Title row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: notification.read ? 700 : 800,
                      fontSize: '0.85rem',
                      lineHeight: 1.3,
                      color: notification.read ? 'text.secondary' : 'text.primary',
                    }}
                    noWrap
                  >
                    {notification.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    {!notification.read && (
                      <Circle sx={{ fontSize: 8, color: notification.color }} />
                    )}
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                      {formatTimestamp(notification.timestamp)}
                    </Typography>
                  </Box>
                </Box>

                {/* Body */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.78rem',
                    lineHeight: 1.5,
                    mt: 0.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {notification.body}
                </Typography>

                {/* Footer: type chip + deep link */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Chip
                    icon={<Box sx={{ display: 'flex', color: notification.color }}>{getTypeIcon(notification.type)}</Box>}
                    label={notification.type.replace('_', ' ')}
                    size="small"
                    sx={{
                      height: 22,
                      fontWeight: 700,
                      fontSize: '0.6rem',
                      textTransform: 'capitalize',
                      bgcolor: `${notification.color}10`,
                      color: notification.color,
                      border: `1px solid ${notification.color}15`,
                      '& .MuiChip-icon': { ml: 0.5 },
                    }}
                  />
                  {notification.deepLink && !notification.read && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, fontSize: '0.65rem' }}>
                        VIEW
                      </Typography>
                      <KeyboardArrowRight sx={{ fontSize: 14, color: 'primary.main' }} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default NotificationsPage;
