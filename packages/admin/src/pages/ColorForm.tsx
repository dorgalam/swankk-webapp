import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Paper, IconButton,
  CircularProgress, Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import adminApi, { slugify } from '@/api/adminApi'
import UrlOrUploadField from '@/components/UrlOrUploadField'
import type { ColorProduct } from '@/api/adminApi'

interface ColorFormState {
  name: string
  slug: string
  hex: string
  description: string
  main_image_url: string
  images: string[]
  products: ColorProduct[]
}

const emptyForm: ColorFormState = {
  name: '', slug: '', hex: '', description: '', main_image_url: '', images: [], products: [],
}

const emptyProduct: ColorProduct = { name: '', image_url: '', link: '' }

export default function ColorForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ColorFormState>({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-color', id],
    queryFn: () => adminApi.colors.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        name: existing.name,
        slug: existing.slug,
        hex: existing.hex || '',
        description: existing.description || '',
        main_image_url: existing.main_image_url || '',
        images: existing.images || [],
        products: existing.products || [],
      })
    }
  }, [isEdit, existing])

  const updateField = (field: keyof ColorFormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !isEdit) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const updateImage = (index: number, value: string) => {
    const images = [...form.images]
    images[index] = value
    setForm((prev) => ({ ...prev, images }))
  }

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const updateProduct = (index: number, field: keyof ColorProduct, value: string) => {
    const products = [...form.products]
    products[index] = { ...products[index], [field]: value }
    setForm((prev) => ({ ...prev, products }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isEdit) {
        await adminApi.colors.update(id!, form)
      } else {
        await adminApi.colors.create(form)
      }
      queryClient.invalidateQueries({ queryKey: ['admin-colors'] })
      navigate('/colors')
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
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/colors')} sx={{ mb: 2 }}>
        Back to Colors
      </Button>

      <Typography variant="h4" gutterBottom>
        {isEdit ? `Edit ${form.name || 'Color'}` : 'New Color'}
      </Typography>

      {/* Basic Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Basic Info</Typography>
        <TextField
          label="Color name"
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
        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <TextField
            label="Hex code"
            size="small"
            value={form.hex}
            onChange={(e) => updateField('hex', e.target.value)}
            placeholder="#000000"
            sx={{ flex: 1 }}
          />
          {form.hex && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                backgroundColor: form.hex,
                border: '1px solid rgba(255,255,255,0.15)',
                flexShrink: 0,
              }}
            />
          )}
        </Box>
        <TextField
          label="Description"
          fullWidth
          size="small"
          multiline
          minRows={3}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </Paper>

      {/* Main Image */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Main / Hero Image</Typography>
        <UrlOrUploadField
          label="Main image"
          value={form.main_image_url}
          onChange={(url) => setForm((prev) => ({ ...prev, main_image_url: url }))}
          accept="image/*"
          folder="colors"
        />
      </Paper>

      {/* Gallery Images */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Gallery Images</Typography>
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
                label={`Image ${i + 1}`}
                value={img}
                onChange={(url) => updateImage(i, url)}
                accept="image/*"
                folder="colors"
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
              folder="colors"
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
        {saving ? 'Saving...' : isEdit ? 'Update Color' : 'Create Color'}
      </Button>
    </Box>
  )
}
