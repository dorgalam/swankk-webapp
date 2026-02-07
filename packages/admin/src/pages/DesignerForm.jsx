import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Paper, Chip, IconButton,
  CircularProgress, Divider,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import adminApi, { slugify } from '@/api/adminApi'

const emptyDesigner = {
  name: '', slug: '', phonetic: '', audio_url: '', origin_meaning: '',
  hero_image_url: '', founder: '', founded_year: '', origin_location: '',
  creative_director: '', known_for_tags: [], eras: [], signature_pieces: [],
}

const emptyEra = { title: '', year_range: '', image_url: '', caption: '', credit: '' }
const emptyPiece = { name: '', image_url: '', brand: '', price: '', farfetch_url: '' }

export default function DesignerForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = Boolean(id)
  const fromRequestId = searchParams.get('from_request')
  const fromName = searchParams.get('name')

  const [form, setForm] = useState({ ...emptyDesigner })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-designer', id],
    queryFn: () => adminApi.designers.getById(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (isEdit && existing) {
      setForm(existing)
    } else if (!isEdit && fromName) {
      setForm((prev) => ({ ...prev, name: fromName, slug: slugify(fromName) }))
    }
  }, [isEdit, existing, fromName])

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'name' && !isEdit) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const updateEra = (index, field, value) => {
    const eras = [...form.eras]
    eras[index] = { ...eras[index], [field]: value }
    setForm((prev) => ({ ...prev, eras }))
  }

  const updatePiece = (index, field, value) => {
    const pieces = [...form.signature_pieces]
    pieces[index] = { ...pieces[index], [field]: value }
    setForm((prev) => ({ ...prev, signature_pieces: pieces }))
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.known_for_tags.includes(tag)) {
      setForm((prev) => ({ ...prev, known_for_tags: [...prev.known_for_tags, tag] }))
    }
    setTagInput('')
  }

  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, known_for_tags: prev.known_for_tags.filter((t) => t !== tag) }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = { ...form }
      delete data.id
      delete data.created_at
      delete data.updated_at

      if (isEdit) {
        await adminApi.designers.update(id, data)
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
        {['name', 'slug', 'phonetic', 'audio_url', 'origin_meaning', 'hero_image_url'].map((field) => (
          <TextField
            key={field}
            label={field.replace(/_/g, ' ')}
            fullWidth
            size="small"
            value={form[field] || ''}
            onChange={(e) => updateField(field, e.target.value)}
            disabled={field === 'slug' && isEdit}
            sx={{ mb: 2, textTransform: 'capitalize' }}
          />
        ))}
      </Paper>

      {/* Facts */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Facts</Typography>
        {['founder', 'founded_year', 'origin_location', 'creative_director'].map((field) => (
          <TextField
            key={field}
            label={field.replace(/_/g, ' ')}
            fullWidth
            size="small"
            value={form[field] || ''}
            onChange={(e) => updateField(field, e.target.value)}
            sx={{ mb: 2, textTransform: 'capitalize' }}
          />
        ))}
      </Paper>

      {/* Known For Tags */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Known For Tags</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {form.known_for_tags.map((tag) => (
            <Chip key={tag} label={tag} onDelete={() => removeTag(tag)} size="small" />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          />
          <Button variant="outlined" size="small" onClick={addTag}>Add</Button>
        </Box>
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
            {['title', 'year_range', 'image_url', 'caption', 'credit'].map((f) => (
              <TextField
                key={f}
                label={f.replace(/_/g, ' ')}
                fullWidth
                size="small"
                value={era[f] || ''}
                onChange={(e) => updateEra(i, f, e.target.value)}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        ))}
      </Paper>

      {/* Signature Pieces */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2">Signature Pieces</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setForm((prev) => ({ ...prev, signature_pieces: [...prev.signature_pieces, { ...emptyPiece }] }))}
          >
            Add Piece
          </Button>
        </Box>
        {form.signature_pieces.map((piece, i) => (
          <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">Piece {i + 1}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => setForm((prev) => ({ ...prev, signature_pieces: prev.signature_pieces.filter((_, j) => j !== i) }))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            {['name', 'image_url', 'brand', 'price', 'farfetch_url'].map((f) => (
              <TextField
                key={f}
                label={f.replace(/_/g, ' ')}
                fullWidth
                size="small"
                value={piece[f] || ''}
                onChange={(e) => updatePiece(i, f, e.target.value)}
                sx={{ mb: 1 }}
              />
            ))}
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
