import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

const ScheduleSkeleton: React.FC = () => {
  return (
    <Stack spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Box key={i}>
          <Skeleton variant="text" width={100} height={20} sx={{ mb: 1, borderRadius: 1 }} />
          <Skeleton 
            variant="rectangular" 
            height={120} 
            sx={{ 
              borderRadius: 6,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }} 
          />
        </Box>
      ))}
    </Stack>
  );
};

export default ScheduleSkeleton;
