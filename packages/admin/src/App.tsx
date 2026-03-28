import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
import Dashboard from '@/pages/Dashboard'
import Designers from '@/pages/Designers'
import DesignerForm from '@/pages/DesignerForm'
import DesignerRequests from '@/pages/DesignerRequests'
import Users from '@/pages/Users'
import Colors from '@/pages/Colors'
import ColorForm from '@/pages/ColorForm'
import ImageTags from '@/pages/ImageTags'
import Products from '@/pages/Products'
import ProductForm from '@/pages/ProductForm'
import Styles from '@/pages/Styles'
import Trends from '@/pages/Trends'
import TrendForm from '@/pages/TrendForm'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: { default: '#0a0a0a', paper: '#1a1a1a' },
  },
})

const queryClient = new QueryClient()

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="designers" element={<Designers />} />
              <Route path="designers/new" element={<DesignerForm />} />
              <Route path="designers/:id/edit" element={<DesignerForm />} />
              <Route path="styles" element={<Styles />} />
              <Route path="colors" element={<Colors />} />
              <Route path="colors/new" element={<ColorForm />} />
              <Route path="colors/:id/edit" element={<ColorForm />} />
              <Route path="trends" element={<Trends />} />
              <Route path="trends/new" element={<TrendForm />} />
              <Route path="trends/:id/edit" element={<TrendForm />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="image-tags" element={<ImageTags />} />
              <Route path="requests" element={<DesignerRequests />} />
              <Route path="users" element={<Users />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
