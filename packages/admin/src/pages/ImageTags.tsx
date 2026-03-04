import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Paper, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Autocomplete, TextField, Avatar, ToggleButton, ToggleButtonGroup,
  Pagination,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import adminApi, { STYLES_LIST, type ImageTag } from '@/api/adminApi'

const PAGE_SIZE = 25

const ENTITY_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Designers', value: 'designer' },
  { label: 'Trends', value: 'trend' },
  { label: 'Colors', value: 'color' },
]

export default function ImageTags() {
  const qc = useQueryClient()
  const [entityType, setEntityType] = useState('')
  const [page, setPage] = useState(1)
  const [editItem, setEditItem] = useState<ImageTag | null>(null)
  const [editTags, setEditTags] = useState<string[]>([])

  const { data: total = 0 } = useQuery({
    queryKey: ['imageTags-count', entityType],
    queryFn: () => adminApi.imageTags.count(entityType || undefined),
  })

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['imageTags', entityType, page],
    queryFn: () => adminApi.imageTags.list(entityType || undefined, PAGE_SIZE, (page - 1) * PAGE_SIZE),
  })

  const saveMutation = useMutation({
    mutationFn: ({ urlHash, tags }: { urlHash: string; tags: string[] }) =>
      adminApi.imageTags.updateTags(urlHash, tags),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['imageTags'] })
      qc.invalidateQueries({ queryKey: ['imageTags-count'] })
      setEditItem(null)
    },
  })

  const handleEdit = (item: ImageTag) => {
    setEditItem(item)
    setEditTags([...item.top_styles])
  }

  const handleSave = () => {
    if (!editItem) return
    saveMutation.mutate({ urlHash: editItem.url_hash, tags: editTags })
  }

  const pageCount = Math.ceil(total / PAGE_SIZE)

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Image Tags</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {total} images tagged
      </Typography>

      <ToggleButtonGroup
        value={entityType}
        exclusive
        onChange={(_, v) => { if (v !== null) { setEntityType(v); setPage(1); } }}
        size="small"
        sx={{ mb: 2 }}
      >
        {ENTITY_FILTERS.map(({ label, value }) => (
          <ToggleButton key={value} value={value}>{label}</ToggleButton>
        ))}
      </ToggleButtonGroup>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={60}>Image</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Style Tags</TableCell>
                  <TableCell width={80} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.url_hash} hover>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={row.url}
                        sx={{ width: 40, height: 56, borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{row.entity_slug}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.entity_type}</Typography>
                    </TableCell>
                    <TableCell>
                      {row.role && <Chip label={row.role} size="small" variant="outlined" />}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {row.top_styles.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(row)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} />
            </Box>
          )}
        </>
      )}

      <Dialog open={!!editItem} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Style Tags</DialogTitle>
        <DialogContent>
          {editItem && (
            <Box sx={{ pt: 1 }}>
              <Box
                component="img"
                src={editItem.url}
                sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 2, mb: 2, bgcolor: 'grey.900' }}
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                {editItem.entity_type} · {editItem.entity_slug} {editItem.role && `· ${editItem.role}`}
              </Typography>
              <Autocomplete
                multiple
                options={STYLES_LIST}
                value={editTags}
                onChange={(_, v) => setEditTags(v.slice(0, 5))}
                renderInput={(params) => (
                  <TextField {...params} label="Style Tags (max 5)" size="small" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} size="small" {...getTagProps({ index })} key={option} />
                  ))
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <CircularProgress size={16} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
