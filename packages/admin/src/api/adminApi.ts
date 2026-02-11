interface QueryResult {
  results: Record<string, unknown>[]
  meta?: Record<string, unknown>
}

interface DesignerRow {
  id: number
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
  known_for_tags: string | Tag[]
  eras: string | Era[]
  signature_pieces: string | Piece[]
  created_at?: string
  updated_at?: string
}

interface Designer extends Omit<DesignerRow, 'known_for_tags' | 'eras' | 'signature_pieces'> {
  known_for_tags: Tag[]
  eras: Era[]
  signature_pieces: Piece[]
}

interface Tag {
  name: string
  description: string
}

interface Era {
  title: string
  year_range: string
  description: string
  images: string[]
  image_url?: string
  caption?: string
}

interface Piece {
  name: string
  image_url: string
  link: string
}

interface DesignerInput {
  name: string
  slug?: string
  phonetic?: string
  audio_url?: string
  origin_meaning?: string
  hero_image_url?: string
  founder?: string
  founded_year?: string
  origin_location?: string
  creative_director?: string
  known_for_tags?: Tag[]
  eras?: Era[]
  signature_pieces?: Piece[]
  [key: string]: unknown
}

interface DesignerRequest {
  id: number
  designer_name: string
  email: string
  status: string
  created_at: string
}

interface User {
  id: number
  email: string
  full_name: string
  created_at: string
  collections_count: number
}

interface StatCounts {
  designers: number
  requests: number
  users: number
  collections: number
  [key: string]: number
}

async function query(sql: string, params: unknown[] = []): Promise<QueryResult> {
  const res = await fetch('/api/admin/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, params }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>
    throw new Error(err.error || `Query failed: ${res.status}`)
  }
  return res.json()
}

function parseDesignerRow(row: DesignerRow | undefined): Designer | null {
  if (!row) return null
  return {
    ...row,
    known_for_tags: JSON.parse((row.known_for_tags as string) || '[]'),
    eras: JSON.parse((row.eras as string) || '[]'),
    signature_pieces: JSON.parse((row.signature_pieces as string) || '[]'),
  }
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const adminApi = {
  stats: {
    async counts(): Promise<StatCounts> {
      const { results } = await query(`
        SELECT
          (SELECT COUNT(*) FROM designers) AS designers,
          (SELECT COUNT(*) FROM designer_requests) AS requests,
          (SELECT COUNT(*) FROM users) AS users,
          (SELECT COUNT(*) FROM collections) AS collections
      `)
      return results[0] as unknown as StatCounts
    },
    async recentRequests(limit: number = 5): Promise<DesignerRequest[]> {
      const { results } = await query(
        'SELECT * FROM designer_requests ORDER BY created_at DESC LIMIT ?',
        [limit],
      )
      return results as unknown as DesignerRequest[]
    },
  },

  designers: {
    async list(): Promise<Designer[]> {
      const { results } = await query(
        'SELECT * FROM designers ORDER BY name ASC',
      )
      return results.map((r) => parseDesignerRow(r as unknown as DesignerRow)!)
    },
    async getById(id: string | number): Promise<Designer | null> {
      const { results } = await query(
        'SELECT * FROM designers WHERE id = ?',
        [id],
      )
      return parseDesignerRow(results[0] as unknown as DesignerRow)
    },
    async create(data: DesignerInput) {
      const slug = data.slug || slugify(data.name)
      const { meta } = await query(
        `INSERT INTO designers (name, slug, phonetic, audio_url, origin_meaning, hero_image_url,
          founder, founded_year, origin_location, creative_director,
          known_for_tags, eras, signature_pieces)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, slug, data.phonetic || '', data.audio_url || '',
          data.origin_meaning || '', data.hero_image_url || '',
          data.founder || '', data.founded_year || '',
          data.origin_location || '', data.creative_director || '',
          JSON.stringify(data.known_for_tags || []),
          JSON.stringify(data.eras || []),
          JSON.stringify(data.signature_pieces || []),
        ],
      )
      return meta
    },
    async update(id: string | number, data: DesignerInput) {
      const sets: string[] = []
      const params: unknown[] = []
      const fields = [
        'name', 'slug', 'phonetic', 'audio_url', 'origin_meaning',
        'hero_image_url', 'founder', 'founded_year', 'origin_location',
        'creative_director',
      ]
      const jsonFields = ['known_for_tags', 'eras', 'signature_pieces']

      for (const f of fields) {
        if (f in data) {
          sets.push(`${f} = ?`)
          params.push(data[f])
        }
      }
      for (const f of jsonFields) {
        if (f in data) {
          sets.push(`${f} = ?`)
          params.push(JSON.stringify(data[f]))
        }
      }
      if (sets.length === 0) return
      sets.push("updated_at = datetime('now')")
      params.push(id)
      const { meta } = await query(
        `UPDATE designers SET ${sets.join(', ')} WHERE id = ?`,
        params,
      )
      return meta
    },
    async delete(id: number) {
      const { meta } = await query('DELETE FROM designers WHERE id = ?', [id])
      return meta
    },
  },

  requests: {
    async list(status?: string): Promise<DesignerRequest[]> {
      if (status) {
        const { results } = await query(
          'SELECT * FROM designer_requests WHERE status = ? ORDER BY created_at DESC',
          [status],
        )
        return results as unknown as DesignerRequest[]
      }
      const { results } = await query(
        'SELECT * FROM designer_requests ORDER BY created_at DESC',
      )
      return results as unknown as DesignerRequest[]
    },
    async updateStatus(id: number | string, status: string) {
      const { meta } = await query(
        'UPDATE designer_requests SET status = ? WHERE id = ?',
        [status, id],
      )
      return meta
    },
    async delete(id: number) {
      const { meta } = await query(
        'DELETE FROM designer_requests WHERE id = ?',
        [id],
      )
      return meta
    },
  },

  assets: {
    async upload(file: File, folder?: string): Promise<{ url: string }> {
      const formData = new FormData()
      formData.append('file', file)
      if (folder) formData.append('folder', folder)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as Record<string, string>
        throw new Error(err.error || `Upload failed: ${res.status}`)
      }
      return res.json()
    },
  },

  users: {
    async list(): Promise<User[]> {
      const { results } = await query(`
        SELECT u.id, u.email, u.full_name, u.created_at,
          (SELECT COUNT(*) FROM collections c WHERE c.owner_email = u.email) AS collections_count
        FROM users u ORDER BY u.created_at DESC
      `)
      return results as unknown as User[]
    },
  },
}

export default adminApi
export { slugify }
export type { Designer, DesignerInput, DesignerRequest, DesignerRow, Era, Piece, StatCounts, Tag, User }
