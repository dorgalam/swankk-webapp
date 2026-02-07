import { Chip } from '@mui/material'

const colorMap = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

export default function StatusChip({ status }) {
  return (
    <Chip
      label={status}
      color={colorMap[status] || 'default'}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  )
}
