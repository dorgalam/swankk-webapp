import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, CircularProgress,
  Chip, Stack,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import adminApi from '@/api/adminApi'
import type { Trend } from '@/api/adminApi'
import { useState } from 'react'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function Trends() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { data: trends, isLoading } = useQuery<Trend[]>({
    queryKey: ['admin-trends'],
    queryFn: () => adminApi.trends.list(),
  })

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await adminApi.trends.delete(deleteId)
      queryClient.invalidateQueries({ queryKey: ['admin-trends'] })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Trends</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/trends/new')}
        >
          New Trend
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : trends?.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No trends yet. Create one to get started.</Typography>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Related Tags</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Images</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Products</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {trends?.map((trend) => (
                  <TableRow key={trend.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Box>
                        {trend.name}
                        <Typography variant="caption" display="block" color="text.secondary">
                          /{trend.slug}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {trend.context || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(trend.related_tags || []).slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag.split(':')[1] ?? tag} size="small" variant="outlined" />
                        ))}
                        {(trend.related_tags || []).length > 3 && (
                          <Chip label={`+${trend.related_tags.length - 3}`} size="small" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={trend.images.length} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={trend.products.length} size="small" />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/trends/${trend.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(trend.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete trend?"
        message="This will permanently delete the trend. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  )
}
