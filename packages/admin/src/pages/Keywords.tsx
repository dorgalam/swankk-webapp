import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Paper, TextField, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Collapse, List, ListItem, ListItemText, Divider,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import SaveIcon from '@mui/icons-material/Save'
import adminApi, { KEYWORDS_LIST } from '@/api/adminApi'
import type { Keyword, Designer } from '@/api/adminApi'

interface KeywordRowProps {
  keyword: Keyword
  onSave: (id: number, description: string) => Promise<void>
}

function KeywordRow({ keyword, onSave }: KeywordRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [description, setDescription] = useState(keyword.description || '')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const { data: relatedDesigners, isLoading: loadingDesigners } = useQuery<Designer[]>({
    queryKey: ['keyword-designers', keyword.name],
    queryFn: () => adminApi.keywords.relatedDesigners(keyword.name),
    enabled: expanded,
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(keyword.id, description)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ fontWeight: 500 }}>{keyword.name}</TableCell>
        <TableCell sx={{ maxWidth: 300 }}>
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
        <TableCell align="center">
          <Chip
            label={keyword.designer_count ?? 0}
            size="small"
            color={(keyword.designer_count ?? 0) > 0 ? 'primary' : 'default'}
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
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
            disabled={(keyword.designer_count ?? 0) === 0}
          >
            Designers
          </Button>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={4} sx={{ py: 0, bgcolor: 'action.hover' }}>
            <Collapse in={expanded}>
              <Box sx={{ py: 1, px: 2 }}>
                {loadingDesigners ? (
                  <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : relatedDesigners?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No designers tagged with this keyword.
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
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export default function Keywords() {
  const queryClient = useQueryClient()

  const { data: keywords, isLoading } = useQuery<Keyword[]>({
    queryKey: ['admin-keywords'],
    queryFn: () => adminApi.keywords.list(),
  })

  // Merge DB keywords with the closed list so all 49 always appear
  const mergedKeywords: Keyword[] = KEYWORDS_LIST.map((name) => {
    const fromDb = keywords?.find((k) => k.name === name)
    if (fromDb) return fromDb
    return { id: 0, name, slug: '', description: '', designer_count: 0 }
  })

  const handleSave = async (id: number, description: string) => {
    await adminApi.keywords.updateDescription(id, description)
    queryClient.invalidateQueries({ queryKey: ['admin-keywords'] })
  }

  const totalDesigners = mergedKeywords.reduce((sum, k) => sum + (k.designer_count ?? 0), 0)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Keywords</Typography>
          <Typography variant="body2" color="text.secondary">
            Closed list of {KEYWORDS_LIST.length} keywords shared across designers, eras, trends and images.
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
                  <TableCell sx={{ fontWeight: 600 }}>Keyword</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Designers</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {mergedKeywords.map((kw) => (
                  <KeywordRow
                    key={kw.name}
                    keyword={kw}
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
