import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Paper, IconButton,
  CircularProgress, Divider, FormControl, RadioGroup,
  Radio, Select, MenuItem, InputLabel, FormControlLabel,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import adminApi, { slugify } from '@/api/adminApi'
import UrlOrUploadField from '@/components/UrlOrUploadField'
import type { Retailer } from '@/api/adminApi'

interface ProductFormState {
  name: string
  slug: string
  brand: string
  image_url: string
  images: string[]
  designerMode: 'list' | 'manual'
  designer_id: number | ''
  designer_name: string
  trend_id: number | ''
  section: '' | 'collaborations' | 'iconic'
  cheapest_price: string
  retailers: Retailer[]
}

const emptyForm: ProductFormState = {
  name: '', slug: '', brand: '', image_url: '', images: [],
  designerMode: 'list', designer_id: '', designer_name: '',
  trend_id: '', section: '', cheapest_price: '',
  retailers: [],
}

const emptyRetailer: Retailer = { name: '', image_url: '', price: '', link: '' }

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ProductFormState>({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminApi.products.getById(id!),
    enabled: isEdit,
  })

  const { data: designers = [] } = useQuery({
    queryKey: ['admin-designers'],
    queryFn: () => adminApi.designers.list(),
  })

  const { data: trends = [] } = useQuery({
    queryKey: ['admin-trends'],
    queryFn: () => adminApi.trends.list(),
  })

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        name: existing.name,
        slug: existing.slug,
        brand: existing.brand || '',
        image_url: existing.image_url || '',
        images: existing.images || [],
        designerMode: existing.designer_id ? 'list' : 'manual',
        designer_id: existing.designer_id ?? '',
        designer_name: existing.designer_name || '',
        trend_id: existing.trend_id ?? '',
        section: (existing.section as ProductFormState['section']) || '',
        cheapest_price: existing.cheapest_price || '',
        retailers: existing.retailers || [],
      })
    }
  }, [isEdit, existing])

  const set = (field: keyof ProductFormState, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !isEdit) next.slug = slugify(value as string)
      return next
    })
  }

  const updateRetailer = (i: number, field: keyof Retailer, value: string) => {
    const retailers = [...form.retailers]
    retailers[i] = { ...retailers[i], [field]: value }
    setForm((prev) => ({ ...prev, retailers }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        name: form.name,
        slug: form.slug,
        brand: form.brand,
        image_url: form.image_url,
        images: form.images,
        designer_id: form.designerMode === 'list' && form.designer_id ? Number(form.designer_id) : null,
        designer_name: form.designerMode === 'manual' ? form.designer_name : '',
        trend_id: form.trend_id ? Number(form.trend_id) : null,
        section: form.section,
        cheapest_price: form.cheapest_price,
        retailers: form.retailers,
      }
      if (isEdit) {
        await adminApi.products.update(id!, data)
      } else {
        await adminApi.products.create(data)
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      navigate('/products')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')} sx={{ mb: 2 }}>
        Back to Products
      </Button>

      <Typography variant="h4" gutterBottom>
        {isEdit ? `Edit ${form.name || 'Product'}` : 'New Product'}
      </Typography>

      {/* Basic Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Basic Info</Typography>
        <TextField label="Product name" fullWidth size="small" value={form.name}
          onChange={(e) => set('name', e.target.value)} sx={{ mb: 2 }} />
        <TextField label="Slug" fullWidth size="small" value={form.slug}
          onChange={(e) => set('slug', e.target.value)} disabled={isEdit} sx={{ mb: 2 }} />
        <TextField label="Brand" fullWidth size="small" value={form.brand}
          onChange={(e) => set('brand', e.target.value)} />
      </Paper>

      {/* Main Image */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Main Image</Typography>
        <UrlOrUploadField label="Image" value={form.image_url}
          onChange={(url) => set('image_url', url)} accept="image/*" folder="products" />
      </Paper>

      {/* Designer */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Designer</Typography>
        <FormControl sx={{ mb: 2 }}>
          <RadioGroup row value={form.designerMode} onChange={(e) => set('designerMode', e.target.value)}>
            <FormControlLabel value="list" control={<Radio size="small" />} label="Select from list" />
            <FormControlLabel value="manual" control={<Radio size="small" />} label="Enter manually" />
          </RadioGroup>
        </FormControl>
        {form.designerMode === 'list' ? (
          <FormControl fullWidth size="small">
            <InputLabel>Designer</InputLabel>
            <Select value={form.designer_id} label="Designer"
              onChange={(e) => set('designer_id', e.target.value)}>
              <MenuItem value=""><em>None</em></MenuItem>
              {designers.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField label="Designer name" fullWidth size="small" value={form.designer_name}
            onChange={(e) => set('designer_name', e.target.value)} />
        )}
      </Paper>

      {/* Trend */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Trend (optional)</Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Trend</InputLabel>
          <Select value={form.trend_id} label="Trend"
            onChange={(e) => set('trend_id', e.target.value)}>
            <MenuItem value=""><em>None</em></MenuItem>
            {trends.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Section</Typography>
        <FormControl>
          <RadioGroup value={form.section} onChange={(e) => set('section', e.target.value)}>
            <FormControlLabel value="" control={<Radio size="small" />} label="None" />
            <FormControlLabel value="collaborations" control={<Radio size="small" />} label="Collaborations" />
            <FormControlLabel value="iconic" control={<Radio size="small" />} label="Iconic" />
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Iconic Details */}
      {form.section === 'iconic' && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Additional Images</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              First is the hero; the rest appear in a carousel
            </Typography>
            {form.images.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>No additional images yet.</Typography>
            )}
            {form.images.map((img, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <UrlOrUploadField label={`Image ${i + 1}`} value={img}
                    onChange={(url) => {
                      const images = [...form.images]; images[i] = url
                      set('images', images)
                    }}
                    accept="image/*" folder="products" />
                </Box>
                <IconButton size="small" color="error" sx={{ mt: 0.5 }}
                  onClick={() => set('images', form.images.filter((_, j) => j !== i))}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon />}
              onClick={() => set('images', [...form.images, ''])}>
              Add Image
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Pricing</Typography>
            <TextField label="Cheapest price" fullWidth size="small" value={form.cheapest_price}
              onChange={(e) => set('cheapest_price', e.target.value)}
              placeholder="e.g. $450" />
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">Retailers (up to 4)</Typography>
              {form.retailers.length < 4 && (
                <Button size="small" startIcon={<AddIcon />}
                  onClick={() => set('retailers', [...form.retailers, { ...emptyRetailer }])}>
                  Add Retailer
                </Button>
              )}
            </Box>
            {form.retailers.length === 0 && (
              <Typography variant="body2" color="text.secondary">No retailers yet.</Typography>
            )}
            {form.retailers.map((r, i) => (
              <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption">Retailer {i + 1}</Typography>
                  <IconButton size="small" color="error"
                    onClick={() => set('retailers', form.retailers.filter((_, j) => j !== i))}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <TextField label="Retailer name" fullWidth size="small" value={r.name}
                  onChange={(e) => updateRetailer(i, 'name', e.target.value)} sx={{ mb: 1 }} />
                <UrlOrUploadField label="Retailer logo" value={r.image_url}
                  onChange={(url) => updateRetailer(i, 'image_url', url)}
                  accept="image/*" folder="retailers" />
                <TextField label="Price" fullWidth size="small" value={r.price}
                  onChange={(e) => updateRetailer(i, 'price', e.target.value)} sx={{ mb: 1 }} />
                <TextField label="Link" fullWidth size="small" value={r.link}
                  onChange={(e) => updateRetailer(i, 'link', e.target.value)} />
              </Box>
            ))}
          </Paper>
        </>
      )}

      <Divider sx={{ mb: 3 }} />

      <Button variant="contained" size="large" fullWidth
        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        onClick={handleSave}
        disabled={saving || !form.name}>
        {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
      </Button>
    </Box>
  )
}
