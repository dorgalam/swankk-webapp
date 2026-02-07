import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Button, IconButton, Avatar,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import adminApi from '@/api/adminApi'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function Designers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: designers = [], isLoading } = useQuery({
    queryKey: ['admin-designers'],
    queryFn: () => adminApi.designers.list(),
  })

  const filtered = designers.filter((d) => {
    const q = search.toLowerCase()
    return !q || d.name.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q)
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    await adminApi.designers.delete(deleteTarget)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-designers'] })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Designers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/designers/new')}
        >
          New Designer
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
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Founded</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell sx={{ width: 48 }}>
                  <Avatar src={d.hero_image_url} alt={d.name} variant="rounded" sx={{ width: 36, height: 36 }} />
                </TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.slug}</TableCell>
                <TableCell>{d.founded_year || '—'}</TableCell>
                <TableCell>{d.known_for_tags?.length || 0}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => navigate(`/designers/${d.id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(d.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  No designers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Designer"
        message="Are you sure you want to delete this designer? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
