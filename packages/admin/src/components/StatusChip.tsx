import { Chip } from '@mui/material'

const colorMap: Record<string, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

interface StatusChipProps {
  status: string
}

export default function StatusChip({ status }: StatusChipProps) {
  return (
    <Chip
      label={status}
      color={colorMap[status] || 'default'}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  )
}
