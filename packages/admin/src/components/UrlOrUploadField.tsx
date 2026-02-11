import { useRef, useState } from 'react'
import { TextField, Button, Box, CircularProgress } from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload'
import adminApi from '@/api/adminApi'

interface UrlOrUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  accept?: string
  folder?: string
}

export default function UrlOrUploadField({ label, value, onChange, accept, folder }: UrlOrUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { url } = await adminApi.assets.upload(file, folder)
      onChange(url)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      // Reset so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
      <TextField
        label={label}
        fullWidth
        size="small"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        variant="outlined"
        size="small"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        sx={{ minWidth: 100, height: 40 }}
        startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
      >
        {uploading ? 'Uploading' : 'Upload'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleFileSelect}
      />
    </Box>
  )
}
