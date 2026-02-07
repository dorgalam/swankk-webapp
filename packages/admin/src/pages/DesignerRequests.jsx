import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, IconButton,
  ToggleButtonGroup, ToggleButton, Menu, MenuItem,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useNavigate } from 'react-router-dom'
import adminApi from '@/api/adminApi'
import StatusChip from '@/components/StatusChip'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function DesignerRequests() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuRow, setMenuRow] = useState(null)

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-requests', filter],
    queryFn: () => adminApi.requests.list(filter === 'all' ? undefined : filter),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-requests'] })

  const handleStatusChange = async (id, status) => {
    await adminApi.requests.updateStatus(id, status)
    setMenuAnchor(null)
    setMenuRow(null)
    invalidate()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await adminApi.requests.delete(deleteTarget)
    setDeleteTarget(null)
    invalidate()
  }

  const handleConvert = (req) => {
    navigate(`/designers/new?from_request=${req.id}&name=${encodeURIComponent(req.designer_name)}`)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Designer Requests</Typography>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, v) => v && setFilter(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="pending">Pending</ToggleButton>
        <ToggleButton value="approved">Approved</ToggleButton>
        <ToggleButton value="rejected">Rejected</ToggleButton>
      </ToggleButtonGroup>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Designer Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.designer_name}</TableCell>
                <TableCell>{req.email || '—'}</TableCell>
                <TableCell><StatusChip status={req.status} /></TableCell>
                <TableCell>{req.created_at}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuRow(req) }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Convert to Designer"
                    onClick={() => handleConvert(req)}
                  >
                    <PersonAddIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteTarget(req.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  No requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuRow(null) }}
      >
        <MenuItem
          disabled={menuRow?.status === 'approved'}
          onClick={() => handleStatusChange(menuRow.id, 'approved')}
        >
          Approve
        </MenuItem>
        <MenuItem
          disabled={menuRow?.status === 'rejected'}
          onClick={() => handleStatusChange(menuRow.id, 'rejected')}
        >
          Reject
        </MenuItem>
        <MenuItem
          disabled={menuRow?.status === 'pending'}
          onClick={() => handleStatusChange(menuRow.id, 'pending')}
        >
          Set Pending
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Request"
        message="Are you sure you want to delete this designer request?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
