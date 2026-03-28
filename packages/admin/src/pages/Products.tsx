import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, IconButton, Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import adminApi from '@/api/adminApi'
import ConfirmDialog from '@/components/ConfirmDialog'

const SECTION_LABELS: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'warning' }> = {
  '': { label: 'None', color: 'default' },
  collaborations: { label: 'Collaboration', color: 'primary' },
  iconic: { label: 'Iconic', color: 'secondary' },
}

export default function Products() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.products.list(),
  })

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    return !q
      || p.name.toLowerCase().includes(q)
      || (p.brand || '').toLowerCase().includes(q)
      || (p.resolved_designer_name || '').toLowerCase().includes(q)
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    await adminApi.products.delete(deleteTarget)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/products/new')}>
          New Product
        </Button>
      </Box>

      <TextField
        placeholder="Search by name, brand, or designer..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, minWidth: 320 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Designer</TableCell>
              <TableCell>Trend</TableCell>
              <TableCell>Section</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', color: 'text.secondary' }}>Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', color: 'text.secondary' }}>No products found</TableCell>
              </TableRow>
            ) : filtered.map((p) => {
              const sec = SECTION_LABELS[p.section] ?? SECTION_LABELS['']
              return (
                <TableRow key={p.id}>
                  <TableCell sx={{ width: 56 }}>
                    {p.image_url ? (
                      <Box
                        component="img"
                        src={p.image_url}
                        alt={p.name}
                        sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1 }}
                      />
                    ) : (
                      <Box sx={{ width: 44, height: 44, bgcolor: 'action.hover', borderRadius: 1 }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                  <TableCell>{p.brand || '—'}</TableCell>
                  <TableCell>{p.resolved_designer_name || '—'}</TableCell>
                  <TableCell>{p.trend_name || '—'}</TableCell>
                  <TableCell>
                    <Chip label={sec.label} color={sec.color} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/products/${p.id}/edit`)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(p.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
