import { useState, useMemo } from 'react'
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

const SOURCE_COLORS: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  products: 'default',
  trend: 'info',
  designer: 'success',
  color: 'warning',
}

interface UnifiedProduct {
  key: string
  name: string
  brand: string
  image_url: string
  source: 'products' | 'trend' | 'designer' | 'color'
  source_name: string
  source_id: number
  source_slug: string
  db_id?: number
  section?: string
  designer_display?: string
  trend_display?: string
}

export default function Products() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.products.list(),
  })

  const { data: trends = [], isLoading: trendsLoading } = useQuery({
    queryKey: ['admin-trends'],
    queryFn: () => adminApi.trends.list(),
  })

  const { data: designers = [], isLoading: designersLoading } = useQuery({
    queryKey: ['admin-designers'],
    queryFn: () => adminApi.designers.list(),
  })

  const { data: colors = [], isLoading: colorsLoading } = useQuery({
    queryKey: ['admin-colors'],
    queryFn: () => adminApi.colors.list(),
  })

  const isLoading = productsLoading || trendsLoading || designersLoading || colorsLoading

  const unified = useMemo<UnifiedProduct[]>(() => {
    const items: UnifiedProduct[] = []

    // New products table
    for (const p of products) {
      items.push({
        key: `product-${p.id}`,
        name: p.name,
        brand: p.brand || '',
        image_url: p.image_url || '',
        source: 'products',
        source_name: 'Products',
        source_id: p.id,
        source_slug: p.slug,
        db_id: p.id,
        section: p.section,
        designer_display: p.resolved_designer_name || '',
        trend_display: p.trend_name || '',
      })
    }

    // Trend products
    for (const t of trends) {
      for (const [i, p] of (t.products || []).entries()) {
        items.push({
          key: `trend-${t.id}-${i}`,
          name: (p as any).name || '',
          brand: (p as any).brand || '',
          image_url: (p as any).image_url || '',
          source: 'trend',
          source_name: t.name,
          source_id: t.id,
          source_slug: t.slug,
        })
      }
    }

    // Designer signature pieces
    for (const d of designers) {
      for (const [i, p] of (d.signature_pieces || []).entries()) {
        items.push({
          key: `designer-${d.id}-${i}`,
          name: (p as any).name || '',
          brand: d.name,
          image_url: (p as any).image_url || '',
          source: 'designer',
          source_name: d.name,
          source_id: d.id,
          source_slug: d.slug,
        })
      }
    }

    // Color products
    for (const c of colors) {
      for (const [i, p] of (c.products || []).entries()) {
        items.push({
          key: `color-${c.id}-${i}`,
          name: (p as any).name || '',
          brand: (p as any).brand || '',
          image_url: (p as any).image_url || '',
          source: 'color',
          source_name: c.name,
          source_id: c.id,
          source_slug: c.slug,
        })
      }
    }

    return items
  }, [products, trends, designers, colors])

  const filtered = unified.filter((p) => {
    const q = search.toLowerCase()
    return !q
      || p.name.toLowerCase().includes(q)
      || p.brand.toLowerCase().includes(q)
      || p.source_name.toLowerCase().includes(q)
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    await adminApi.products.delete(deleteTarget)
    setDeleteTarget(null)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }

  const handleEdit = (p: UnifiedProduct) => {
    if (p.source === 'products') {
      navigate(`/products/${p.db_id}/edit`)
    } else if (p.source === 'trend') {
      navigate(`/trends/${p.source_id}/edit`)
    } else if (p.source === 'designer') {
      navigate(`/designers/${p.source_id}/edit`)
    } else if (p.source === 'color') {
      navigate(`/colors/${p.source_id}/edit`)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4">Products</Typography>
          {!isLoading && (
            <Typography variant="caption" color="text.secondary">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} across all sources
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/products/new')}>
          New Product
        </Button>
      </Box>

      <TextField
        placeholder="Search by name, brand, or source..."
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
              <TableCell>Source</TableCell>
              <TableCell>Section</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', color: 'text.secondary' }}>Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', color: 'text.secondary' }}>No products found</TableCell>
              </TableRow>
            ) : filtered.map((p) => {
              const sec = p.section ? (SECTION_LABELS[p.section] ?? SECTION_LABELS['']) : null
              return (
                <TableRow key={p.key}>
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
                  <TableCell sx={{ fontWeight: 500 }}>{p.name || '—'}</TableCell>
                  <TableCell>{p.brand || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.source === 'products' ? 'Products DB' : `${p.source === 'trend' ? 'Trend' : p.source === 'designer' ? 'Designer' : 'Color'}: ${p.source_name}`}
                      color={SOURCE_COLORS[p.source]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {sec ? <Chip label={sec.label} color={sec.color} size="small" /> : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(p)} title={p.source !== 'products' ? `Edit in ${p.source} form` : 'Edit product'}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {p.source === 'products' && (
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(p.db_id!)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
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
