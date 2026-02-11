import { useQuery } from '@tanstack/react-query'
import {
  Box, Card, CardActionArea, CardContent, Grid, Typography,
  CircularProgress, List, ListItem, ListItemText,
} from '@mui/material'
import BrushIcon from '@mui/icons-material/Brush'
import InboxIcon from '@mui/icons-material/Inbox'
import PeopleIcon from '@mui/icons-material/People'
import FolderIcon from '@mui/icons-material/Folder'
import { useNavigate } from 'react-router-dom'
import adminApi from '@/api/adminApi'
import StatusChip from '@/components/StatusChip'

const statCards = [
  { key: 'designers', label: 'Designers', icon: <BrushIcon />, path: '/designers' },
  { key: 'requests', label: 'Requests', icon: <InboxIcon />, path: '/requests' },
  { key: 'users', label: 'Users', icon: <PeopleIcon />, path: '/users' },
  { key: 'collections', label: 'Collections', icon: <FolderIcon />, path: null },
]

export default function Dashboard() {
  const navigate = useNavigate()

  const { data: counts, isLoading: countsLoading } = useQuery({
    queryKey: ['admin-counts'],
    queryFn: () => adminApi.stats.counts(),
  })

  const { data: recentRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['admin-recent-requests'],
    queryFn: () => adminApi.stats.recentRequests(5),
  })

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      {countsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {statCards.map(({ key, label, icon, path }) => (
              <Grid item xs={6} md={3} key={key}>
                <Card>
                  <CardActionArea onClick={() => path && navigate(path)} disabled={!path}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box sx={{ color: 'primary.main', mb: 1 }}>{icon}</Box>
                      <Typography variant="h4">{counts?.[key] ?? '—'}</Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" gutterBottom>Recent Requests</Typography>
          <Card>
            {requestsLoading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
            ) : recentRequests?.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">No requests yet</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {recentRequests?.map((req) => (
                  <ListItem key={req.id} divider>
                    <ListItemText
                      primary={req.designer_name}
                      secondary={req.email || '—'}
                    />
                    <StatusChip status={req.status} />
                  </ListItem>
                ))}
              </List>
            )}
          </Card>
        </>
      )}
    </Box>
  )
}
