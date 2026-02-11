import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
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

interface TagItem {
  name: string
  description: string
}

interface EraItem {
  title: string
  year_range: string
  description: string
  images: string[]
}

interface PieceItem {
  name: string
  image_url: string
  link: string
}

interface DesignerFormState {
  id?: number
  name: string
  slug: string
  phonetic: string
  audio_url: string
  origin_meaning: string
  hero_image_url: string
  founder: string
  founded_year: string
  origin_location: string
  creative_director: string
  known_for_tags: TagItem[]
  eras: EraItem[]
  signature_pieces: PieceItem[]
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

const emptyDesigner: DesignerFormState = {
  name: '', slug: '', phonetic: '', audio_url: '', origin_meaning: '',
  hero_image_url: '', founder: '', founded_year: '', origin_location: '',
  creative_director: '', known_for_tags: [], eras: [], signature_pieces: [],
}

const emptyTag: TagItem = { name: '', description: '' }
const emptyEra: EraItem = { title: '', year_range: '', description: '', images: [] }
const emptyPiece: PieceItem = { name: '', image_url: '', link: '' }

/** Migrate old data shapes to the new format */
function migrateDesignerData(raw: Record<string, unknown>): DesignerFormState {
  const data = { ...raw } as DesignerFormState

  // Tags: string[] → TagItem[]
  if (Array.isArray(data.known_for_tags)) {
    data.known_for_tags = data.known_for_tags.map((t: unknown) => {
      if (typeof t === 'string') return { name: t, description: '' }
      return t as TagItem
    })
  }

  // Eras: migrate image_url → images[], caption → description, drop credit
  if (Array.isArray(data.eras)) {
    data.eras = data.eras.map((e: Record<string, unknown>) => {
      const era: EraItem = {
        title: (e.title as string) || '',
        year_range: (e.year_range as string) || '',
        description: (e.description as string) || (e.caption as string) || '',
        images: Array.isArray(e.images) ? (e.images as string[]) : [],
      }
      // Migrate single image_url into images array if not already there
      if (e.image_url && typeof e.image_url === 'string' && !era.images.includes(e.image_url)) {
        era.images = [e.image_url, ...era.images]
      }
      return era
    })
  }

  // Pieces: migrate farfetch_url → link, drop brand/price
  if (Array.isArray(data.signature_pieces)) {
    data.signature_pieces = data.signature_pieces.map((p: Record<string, unknown>) => ({
      name: (p.name as string) || '',
      image_url: (p.image_url as string) || '',
      link: (p.link as string) || (p.farfetch_url as string) || '',
    }))
  }

  return data
}

/** Add backward-compat fields so the web-side ErasCarousel still works */
function addBackwardCompat(data: DesignerFormState) {
  const out = { ...data }
  if (Array.isArray(out.eras)) {
    out.eras = out.eras.map((era) => ({
      ...era,
      image_url: era.images[0] || '',
      caption: era.description,
    }))
  }
  return out
}

export default function DesignerForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)
  const fromRequestId = searchParams.get('from_request')
  const fromName = searchParams.get('name')

  const [form, setForm] = useState<DesignerFormState>({ ...emptyDesigner })
  const [saving, setSaving] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-designer', id],
    queryFn: () => adminApi.designers.getById(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && existing) {
      setForm(migrateDesignerData(existing as unknown as Record<string, unknown>))
    } else if (!isEdit && fromName) {
      setForm((prev) => ({ ...prev, name: fromName, slug: slugify(fromName) }))
    }
  }, [isEdit, existing, fromName])

  const updateField = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !isEdit) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const updateTag = (index: number, field: keyof TagItem, value: string) => {
    const tags = [...form.known_for_tags]
    tags[index] = { ...tags[index], [field]: value }
    setForm((prev) => ({ ...prev, known_for_tags: tags }))
  }

  const updateEra = (index: number, field: string, value: string) => {
    const eras = [...form.eras]
    eras[index] = { ...eras[index], [field]: value }
    setForm((prev) => ({ ...prev, eras }))
  }

  const updateEraImage = (eraIndex: number, imageIndex: number, value: string) => {
    const eras = [...form.eras]
    const images = [...eras[eraIndex].images]
    images[imageIndex] = value
    eras[eraIndex] = { ...eras[eraIndex], images }
    setForm((prev) => ({ ...prev, eras }))
  }

  const addEraImage = (eraIndex: number) => {
    const eras = [...form.eras]
    eras[eraIndex] = { ...eras[eraIndex], images: [...eras[eraIndex].images, ''] }
    setForm((prev) => ({ ...prev, eras }))
  }

  const removeEraImage = (eraIndex: number, imageIndex: number) => {
    const eras = [...form.eras]
    eras[eraIndex] = { ...eras[eraIndex], images: eras[eraIndex].images.filter((_, j) => j !== imageIndex) }
    setForm((prev) => ({ ...prev, eras }))
  }

  const updatePiece = (index: number, field: string, value: string) => {
    const pieces = [...form.signature_pieces]
    pieces[index] = { ...pieces[index], [field]: value }
    setForm((prev) => ({ ...prev, signature_pieces: pieces }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = addBackwardCompat({ ...form })
      delete data.id
      delete data.created_at
      delete data.updated_at

      if (isEdit) {
        await adminApi.designers.update(id!, data)
      } else {
        await adminApi.designers.create(data)
        if (fromRequestId) {
          await adminApi.requests.updateStatus(fromRequestId, 'approved')
        }
      }
      queryClient.invalidateQueries({ queryKey: ['admin-designers'] })
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] })
      navigate('/designers')
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
        onClick={() => navigate('/designers')}
        sx={{ mb: 2 }}
      >
        Back to Designers
      </Button>

      <Typography variant="h4" gutterBottom>
        {isEdit ? `Edit ${form.name || 'Designer'}` : 'New Designer'}
      </Typography>

      {/* Basic Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Basic Info</Typography>
        <TextField
          label="Name"
          fullWidth
          size="small"
          value={form.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Slug"
          fullWidth
          size="small"
          value={form.slug || ''}
          onChange={(e) => updateField('slug', e.target.value)}
          disabled={isEdit}
          sx={{ mb: 2 }}
        />
        <TextField
          label="How to pronounce"
          fullWidth
          size="small"
          value={form.phonetic || ''}
          onChange={(e) => updateField('phonetic', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Name meaning"
          fullWidth
          size="small"
          multiline
          minRows={2}
          value={form.origin_meaning || ''}
          onChange={(e) => updateField('origin_meaning', e.target.value)}
          sx={{ mb: 2 }}
        />
        <UrlOrUploadField
          label="Pronunciation (MP3)"
          value={form.audio_url}
          onChange={(url) => updateField('audio_url', url)}
          accept="audio/*"
          folder="audio"
        />
        <UrlOrUploadField
          label="Hero image"
          value={form.hero_image_url}
          onChange={(url) => updateField('hero_image_url', url)}
          accept="image/*"
          folder="images"
        />
      </Paper>

      {/* Facts */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Facts</Typography>
        <TextField
          label="Founder"
          fullWidth
          size="small"
          value={form.founder || ''}
          onChange={(e) => updateField('founder', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Year"
          fullWidth
          size="small"
          value={form.founded_year || ''}
          onChange={(e) => updateField('founded_year', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Location"
          fullWidth
          size="small"
          value={form.origin_location || ''}
          onChange={(e) => updateField('origin_location', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Creative director"
          fullWidth
          size="small"
          value={form.creative_director || ''}
          onChange={(e) => updateField('creative_director', e.target.value)}
          sx={{ mb: 2 }}
        />
      </Paper>

      {/* Known For Tags */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Known For Tags</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setForm((prev) => ({ ...prev, known_for_tags: [...prev.known_for_tags, { ...emptyTag }] }))}
          >
            Add Tag
          </Button>
        </Box>
        {form.known_for_tags.map((tag, i) => (
          <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">Tag {i + 1}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => setForm((prev) => ({ ...prev, known_for_tags: prev.known_for_tags.filter((_, j) => j !== i) }))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="Tag name"
              fullWidth
              size="small"
              value={tag.name || ''}
              onChange={(e) => updateTag(i, 'name', e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              label="Tag description"
              fullWidth
              size="small"
              multiline
              minRows={2}
              value={tag.description || ''}
              onChange={(e) => updateTag(i, 'description', e.target.value)}
            />
          </Box>
        ))}
      </Paper>

      {/* Eras */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Eras</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setForm((prev) => ({ ...prev, eras: [...prev.eras, { ...emptyEra }] }))}
          >
            Add Era
          </Button>
        </Box>
        {form.eras.map((era, i) => (
          <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">Era {i + 1}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => setForm((prev) => ({ ...prev, eras: prev.eras.filter((_, j) => j !== i) }))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="Era name"
              fullWidth
              size="small"
              value={era.title || ''}
              onChange={(e) => updateEra(i, 'title', e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              label="Era year"
              fullWidth
              size="small"
              value={era.year_range || ''}
              onChange={(e) => updateEra(i, 'year_range', e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              label="Era description"
              fullWidth
              size="small"
              multiline
              minRows={2}
              value={era.description || ''}
              onChange={(e) => updateEra(i, 'description', e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ pl: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption">Images</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => addEraImage(i)}>
                  Add Image
                </Button>
              </Box>
              {era.images.map((img, j) => (
                <Box key={j} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <UrlOrUploadField
                      label={`Image ${j + 1}`}
                      value={img}
                      onChange={(url) => updateEraImage(i, j, url)}
                      accept="image/*"
                      folder="images"
                    />
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeEraImage(i, j)}
                    sx={{ mt: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Products (formerly Signature Pieces) */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Products</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setForm((prev) => ({ ...prev, signature_pieces: [...prev.signature_pieces, { ...emptyPiece }] }))}
          >
            Add Product
          </Button>
        </Box>
        {form.signature_pieces.map((piece, i) => (
          <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">Product {i + 1}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => setForm((prev) => ({ ...prev, signature_pieces: prev.signature_pieces.filter((_, j) => j !== i) }))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="Product name"
              fullWidth
              size="small"
              value={piece.name || ''}
              onChange={(e) => updatePiece(i, 'name', e.target.value)}
              sx={{ mb: 1 }}
            />
            <UrlOrUploadField
              label="Product image"
              value={piece.image_url || ''}
              onChange={(url) => updatePiece(i, 'image_url', url)}
              accept="image/*"
              folder="images"
            />
            <TextField
              label="Product link"
              fullWidth
              size="small"
              value={piece.link || ''}
              onChange={(e) => updatePiece(i, 'link', e.target.value)}
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
        {saving ? 'Saving...' : isEdit ? 'Update Designer' : 'Create Designer'}
      </Button>
    </Box>
  )
}
