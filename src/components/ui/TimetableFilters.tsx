import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { FilterList, Event, School, Person } from '@mui/icons-material';

interface TimetableFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const TimetableFilters: React.FC<TimetableFiltersProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All', icon: <FilterList /> },
    { id: 'today', label: 'Today Only', icon: <Event /> },
    { id: 'lecture', label: 'Lectures', icon: <School /> },
    { id: 'lab', label: 'Labs', icon: <School /> },
  ];

  return (
    <Box sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
      <Stack direction="row" spacing={1.5} sx={{ minWidth: 'max-content' }}>
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.label}
            icon={React.cloneElement(filter.icon as React.ReactElement, { sx: { fontSize: '1rem !important' } })}
            onClick={() => onFilterChange(filter.id)}
            variant={activeFilter === filter.id ? 'filled' : 'outlined'}
            color={activeFilter === filter.id ? 'primary' : 'default'}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              px: 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default TimetableFilters;
