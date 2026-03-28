import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Paper, TextField, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Collapse, List, ListItem, ListItemText, Divider, Autocomplete,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import SaveIcon from '@mui/icons-material/Save'
import ImageIcon from '@mui/icons-material/Image'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PeopleIcon from '@mui/icons-material/People'
import adminApi, { STYLES_LIST } from '@/api/adminApi'
import type { Style, Designer, Trend } from '@/api/adminApi'

type ExpandedView = 'designers' | 'images' | 'trends' | null

interface StyleRowProps {
  style: Style
  allOptions: { label: string; value: string }[]
  onSave: (id: number, description: string, relatedTags: string[]) => Promise<void>
}

function StyleRow({ style, allOptions, onSave }: StyleRowProps) {
  const [expandedView, setExpandedView] = useState<ExpandedView>(null)
  const [description, setDescription] = useState(style.description || '')
  const [relatedTags, setRelatedTags] = useState<string[]>(style.related_tags || [])
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const { data: relatedDesigners, isLoading: loadingDesigners } = useQuery<Designer[]>({
    queryKey: ['style-designers', style.name],
    queryFn: () => adminApi.styles.relatedDesigners(style.name),
    enabled: expandedView === 'designers',
  })

  const { data: relatedImages, isLoading: loadingImages } = useQuery<{ url: string; entity_type: string; entity_slug: string }[]>({
    queryKey: ['style-images', style.name],
    queryFn: () => adminApi.styles.relatedImages(style.name),
    enabled: expandedView === 'images',
  })

  const { data: relatedTrends, isLoading: loadingTrends } = useQuery<Trend[]>({
    queryKey: ['style-trends', style.slug],
    queryFn: () => adminApi.styles.relatedTrends(style.slug),
    enabled: expandedView === 'trends' && !!style.slug,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(style.id, description, relatedTags)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  const toggleView = (view: ExpandedView) => {
    setExpandedView(expandedView === view ? null : view)
  }

  const isExpanded = expandedView !== null

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ fontWeight: 500 }}>{style.name}</TableCell>
        <TableCell sx={{ maxWidth: 280 }}>
          <TextField
            size="small"
            fullWidth
            multiline
            maxRows={2}
            placeholder="Add description..."
            value={description}
            onChange={(e) => { setDescription(e.target.value); setDirty(true) }}
            variant="standard"
          />
        </TableCell>
        <TableCell sx={{ minWidth: 260 }}>
          <Autocomplete
            multiple
            size="small"
            options={allOptions.filter((o) => {
              const slug = o.value.split(':')[1]
              return slug !== style.slug
            })}
            getOptionLabel={(o) => o.label}
            value={allOptions.filter((o) => relatedTags.includes(o.value))}
            onChange={(_, newVal) => {
              setRelatedTags(newVal.map((v) => v.value))
              setDirty(true)
            }}
            isOptionEqualToValue={(a, b) => a.value === b.value}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.value}
                  label={option.label}
                  size="small"
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} variant="standard" placeholder="Add related tags..." />
            )}
          />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={style.designer_count ?? 0}
            size="small"
            color={(style.designer_count ?? 0) > 0 ? 'primary' : 'default'}
          />
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {dirty && (
            <Button
              size="small"
              variant="contained"
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ mr: 1 }}
            >
              Save
            </Button>
          )}
          <Button
            size="small"
            startIcon={<PeopleIcon />}
            endIcon={expandedView === 'designers' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => toggleView('designers')}
            disabled={(style.designer_count ?? 0) === 0}
            sx={{ mr: 0.5 }}
          >
            Designers
          </Button>
          <Button
            size="small"
            startIcon={<ImageIcon />}
            endIcon={expandedView === 'images' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => toggleView('images')}
          >
            Images
          </Button>
          <Button
            size="small"
            startIcon={<TrendingUpIcon />}
            endIcon={expandedView === 'trends' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => toggleView('trends')}
            sx={{ ml: 0.5 }}
          >
            Trends
          </Button>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow>
          <TableCell colSpan={5} sx={{ py: 0, bgcolor: 'action.hover' }}>
            <Collapse in={isExpanded}>
              <Box sx={{ py: 2, px: 2 }}>

                {/* Designers section */}
                {expandedView === 'designers' && (
                  loadingDesigners ? (
                    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : relatedDesigners?.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No designers tagged with this style.
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {relatedDesigners?.map((d, i) => (
                        <Box key={d.id}>
                          {i > 0 && <Divider />}
                          <ListItem disablePadding sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={d.name}
                              secondary={d.slug}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        </Box>
                      ))}
                    </List>
                  )
                )}

                {/* Images section */}
                {expandedView === 'images' && (
                  loadingImages ? (
                    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : !relatedImages?.length ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No images tagged with this style yet.
                    </Typography>
                  ) : (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                        {relatedImages.length} image{relatedImages.length !== 1 ? 's' : ''} tagged with "{style.name}"
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {relatedImages.map((img, i) => (
                          <Box
                            key={i}
                            component="a"
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ position: 'relative', width: 80, height: 100, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}
                          >
                            <Box
                              component="img"
                              src={img.url}
                              alt={img.entity_slug}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            <Box sx={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              bgcolor: 'rgba(0,0,0,0.55)', px: 0.5, py: 0.25,
                            }}>
                              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem', lineHeight: 1.2, display: 'block' }}>
                                {img.entity_slug}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )
                )}

                {/* Trends section */}
                {expandedView === 'trends' && (
                  loadingTrends ? (
                    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : !relatedTrends?.length ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No trends linked to this style. Use "Related Tags" above to link trends.
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {relatedTrends?.map((t, i) => (
                        <Box key={t.id}>
                          {i > 0 && <Divider />}
                          <ListItem disablePadding sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={t.name}
                              secondary={t.slug}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        </Box>
                      ))}
                    </List>
                  )
                )}

              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function Styles() {
  const queryClient = useQueryClient()

  const { data: styles, isLoading } = useQuery<Style[]>({
    queryKey: ['admin-styles'],
    queryFn: () => adminApi.styles.list(),
  })

  const { data: designers = [] } = useQuery<Designer[]>({
    queryKey: ['admin-designers'],
    queryFn: () => adminApi.designers.list(),
  })

  const { data: trends = [] } = useQuery<Trend[]>({
    queryKey: ['admin-trends'],
    queryFn: () => adminApi.trends.list(),
  })

  // Build combined options list for Related Tags autocomplete
  const allOptions: { label: string; value: string }[] = [
    ...(designers as Designer[]).map((d) => ({ label: `${d.name} · designer`, value: `designer:${d.slug}` })),
    ...(styles || []).map((s) => ({ label: `${s.name} · style`, value: `style:${s.slug}` })),
    ...(trends as Trend[]).map((t) => ({ label: `${t.name} · trend`, value: `trend:${t.slug}` })),
  ]

  // Merge DB styles with the closed list so all always appear
  const mergedStyles: Style[] = STYLES_LIST.map((name) => {
    const fromDb = styles?.find((s) => s.name === name)
    if (fromDb) return fromDb
    return { id: 0, name, slug: '', description: '', designer_count: 0 }
  })

  const handleSave = async (id: number, description: string, relatedTags: string[]) => {
    await adminApi.styles.updateDescription(id, description)
    await adminApi.styles.updateRelatedTags(id, relatedTags)
    queryClient.invalidateQueries({ queryKey: ['admin-designers'] })
    queryClient.invalidateQueries({ queryKey: ['admin-styles'] })
    queryClient.invalidateQueries({ queryKey: ['admin-trends'] })
  }

  const totalDesigners = mergedStyles.reduce((sum, s) => sum + (s.designer_count ?? 0), 0)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Styles</Typography>
          <Typography variant="body2" color="text.secondary">
            Closed list of {STYLES_LIST.length} fashion styles shared across designers, eras, trends and images.
            {!isLoading && ` · ${totalDesigners} total designer tags`}
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Style</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Related Tags</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Designers</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {mergedStyles.map((style) => (
                  <StyleRow
                    key={style.name}
                    style={style}
                    allOptions={allOptions}
                    onSave={handleSave}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  )
}
