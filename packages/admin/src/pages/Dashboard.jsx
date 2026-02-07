import { useQuery } from '@tanstack/react-query'
import {
  Box, Card, CardActionArea, CardContent, Grid, Typography, CircularProgress,
} from '@mui/material'
import StorageIcon from '@mui/icons-material/Storage'

export default function Dashboard() {
  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => fetch('/api/admin/tables').then((r) => r.json()),
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Database Tables</Typography>
      <Grid container spacing={2}>
        {tables?.map((name) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <Card>
              <CardActionArea>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StorageIcon color="primary" />
                  <Typography variant="h6">{name}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
