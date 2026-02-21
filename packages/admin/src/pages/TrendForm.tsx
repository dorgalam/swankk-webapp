import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Paper, IconButton,
  CircularProgress, Divider, Autocomplete, Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import adminApi, { slugify, KEYWORDS_LIST } from '@/api/adminApi'
import UrlOrUploadField from '@/components/UrlOrUploadField'
import type { TrendProduct } from '@/api/adminApi'

interface TrendFormState {
  name: string
  slug: string
  context: string
  designer_slugs: string[]
  keywords: string[]
  images: string[]
  products: TrendProduct[]
}

const emptyForm: TrendFormState = {
  name: '', slug: '', context: '',
  designer_slugs: [], keywords: [], images: [], products: [],
}

const emptyProduct: TrendProduct = { name: '', image_url: '', link: '' }

export default function TrendForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<TrendFormState>({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-trend', id],
    queryFn: () => adminApi.trends.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        name: existing.name,
        slug: existing.slug,
        context: existing.context || '',
        designer_slugs: existing.designer_slugs || [],
        keywords: existing.keywords || [],
        images: existing.images || [],
        products: existing.products || [],
      })
    }
  }, [isEdit, existing])

  const updateField = (field: keyof TrendFormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !isEdit) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const updateProduct = (index: number, field: keyof TrendProduct, value: string) => {
    const products = [...form.products]
    products[index] = { ...products[index], [field]: value }
    setForm((prev) => ({ ...prev, products }))
  }

  const updateImage = (index: number, value: string) => {
    const images = [...form.images]
    images[index] = value
    setForm((prev) => ({ ...prev, images }))
  }

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isEdit) {
        await adminApi.trends.update(id!, form)
      } else {
        await adminApi.trends.create(form)
      }
      queryClient.invalidateQueries({ queryKey: ['admin-trends'] })
      navigate('/trends')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/trends')}
        sx={{ mb: 2 }}
      >
        Back to Trends
      </Button>

      <Typography variant="h4" gutterBottom>
        {isEdit ? `Edit ${form.name || 'Trend'}` : 'New Trend'}
      </Typography>

      {/* Basic Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Basic Info</Typography>
        <TextField
          label="Trend name"
          fullWidth
          size="small"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Slug"
          fullWidth
          size="small"
          value={form.slug}
          onChange={(e) => updateField('slug', e.target.value)}
          disabled={isEdit}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description"
          fullWidth
          size="small"
          multiline
          minRows={3}
          value={form.context}
          onChange={(e) => updateField('context', e.target.value)}
        />
      </Paper>

      {/* Keywords */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Keywords</Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          Select from the closed list of {KEYWORDS_LIST.length} keywords.
        </Typography>
        <Autocomplete
          multiple
          options={KEYWORDS_LIST}
          value={form.keywords}
          onChange={(_, newValue) => setForm((prev) => ({ ...prev, keywords: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                size="small"
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="Search and select keywords..."
            />
          )}
        />
      </Paper>

      {/* Images */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2">Images</Typography>
            <Typography variant="caption" color="text.secondary">
              First 3 images are used as homepage preview.
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setForm((prev) => ({ ...prev, images: [...prev.images, ''] }))}
          >
            Add Image
          </Button>
        </Box>
        {form.images.length === 0 && (
          <Typography variant="body2" color="text.secondary">No images yet.</Typography>
        )}
        {form.images.map((img, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <UrlOrUploadField
                label={i < 3 ? `Image ${i + 1} (preview)` : `Image ${i + 1}`}
                value={img}
                onChange={(url) => updateImage(i, url)}
                accept="image/*"
                folder="trends"
              />
            </Box>
            <IconButton size="small" color="error" onClick={() => removeImage(i)} sx={{ mt: 0.5 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Paper>

      {/* Products */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Products</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setForm((prev) => ({ ...prev, products: [...prev.products, { ...emptyProduct }] }))}
          >
            Add Product
          </Button>
        </Box>
        {form.products.length === 0 && (
          <Typography variant="body2" color="text.secondary">No products yet.</Typography>
        )}
        {form.products.map((product, i) => (
          <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">Product {i + 1}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => setForm((prev) => ({ ...prev, products: prev.products.filter((_, j) => j !== i) }))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="Product name"
              fullWidth
              size="small"
              value={product.name}
              onChange={(e) => updateProduct(i, 'name', e.target.value)}
              sx={{ mb: 1 }}
            />
            <UrlOrUploadField
              label="Product image"
              value={product.image_url}
              onChange={(url) => updateProduct(i, 'image_url', url)}
              accept="image/*"
              folder="trends"
            />
            <TextField
              label="Product link"
              fullWidth
              size="small"
              value={product.link}
              onChange={(e) => updateProduct(i, 'link', e.target.value)}
            />
          </Box>
        ))}
      </Paper>

      <Divider sx={{ mb: 3 }} />

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        onClick={handleSave}
        disabled={saving || !form.name}
      >
        {saving ? 'Saving...' : isEdit ? 'Update Trend' : 'Create Trend'}
      </Button>
    </Box>
  )
}
