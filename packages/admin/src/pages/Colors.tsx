import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import adminApi from '@/api/adminApi'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function Colors() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data: colors = [], isLoading } = useQuery({
    queryKey: ['admin-colors'],
    queryFn: () => adminApi.colors.list(),
  })

  const filtered = colors.filter((c) => {
    const q = search.toLowerCase()
    return !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    await adminApi.colors.delete(deleteTarget)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-colors'] })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Colors</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/colors/new')}
        >
          New Color
        </Button>
      </Box>

      <TextField
        placeholder="Search by name or slug..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, minWidth: 300 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Swatch</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Hex</TableCell>
              <TableCell>Images</TableCell>
              <TableCell>Products</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  No colors found
                </TableCell>
              </TableRow>
            ) : filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell sx={{ width: 48 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: c.hex || '#e5e5e5',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  />
                </TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.slug}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{c.hex || '—'}</TableCell>
                <TableCell>{c.images?.length || 0}</TableCell>
                <TableCell>{c.products?.length || 0}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate(`/colors/${c.id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(c.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Color"
        message="Are you sure you want to delete this color? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
