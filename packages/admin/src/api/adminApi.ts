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
  related_tags: string | string[]
  created_at?: string
  updated_at?: string
}

interface Designer extends Omit<DesignerRow, 'known_for_tags' | 'eras' | 'signature_pieces' | 'related_tags'> {
  known_for_tags: Tag[]
  eras: Era[]
  signature_pieces: Piece[]
  related_tags: string[]
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
  related_tags?: string[]
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

interface Style {
  id: number
  name: string
  slug: string
  description: string
  related_tags?: string[]
  designer_count?: number
  created_at?: string
  updated_at?: string
}

interface TrendRow {
  id: number
  name: string
  slug: string
  context: string
  designer_slugs: string | string[]
  preview_images: string | string[]
  images: string | string[]
  products: string | TrendProduct[]
  related_tags: string | string[]
  created_at?: string
  updated_at?: string
}

interface Trend extends Omit<TrendRow, 'designer_slugs' | 'preview_images' | 'images' | 'products' | 'related_tags'> {
  designer_slugs: string[]
  preview_images: string[]
  images: string[]
  products: TrendProduct[]
  related_tags: string[]
}

interface TrendProduct {
  name: string
  image_url: string
  link: string
}

interface Retailer {
  name: string
  image_url: string
  price: string
  link: string
}

interface ProductRow {
  id: number
  name: string
  slug: string
  brand: string
  image_url: string
  images: string | string[]
  designer_id: number | null
  designer_name: string
  trend_id: number | null
  section: string
  cheapest_price: string
  retailers: string | Retailer[]
  resolved_designer_name?: string
  trend_name?: string
  created_at?: string
  updated_at?: string
}

interface Product extends Omit<ProductRow, 'images' | 'retailers'> {
  images: string[]
  retailers: Retailer[]
}

interface ProductInput {
  name: string
  slug?: string
  brand?: string
  image_url?: string
  images?: string[]
  designer_id?: number | null
  designer_name?: string
  trend_id?: number | null
  section?: string
  cheapest_price?: string
  retailers?: Retailer[]
  [key: string]: unknown
}

interface ColorProduct {
  name: string
  image_url: string
  link: string
}

interface ColorRow {
  id: number
  name: string
  slug: string
  hex: string
  description: string
  main_image_url: string
  images: string | string[]
  products: string | ColorProduct[]
  related_tags: string | string[]
  created_at?: string
  updated_at?: string
}

interface Color extends Omit<ColorRow, 'images' | 'products' | 'related_tags'> {
  images: string[]
  products: ColorProduct[]
  related_tags: string[]
}

interface ColorInput {
  name: string
  slug?: string
  hex?: string
  description?: string
  main_image_url?: string
  images?: string[]
  products?: ColorProduct[]
  related_tags?: string[]
  [key: string]: unknown
}

interface TrendInput {
  name: string
  slug?: string
  context?: string
  designer_slugs?: string[]
  preview_images?: string[]
  images?: string[]
  products?: TrendProduct[]
  related_tags?: string[]
  [key: string]: unknown
}

// The closed list of fashion style concepts
export const STYLES_LIST = [
  'Minimalist', 'Maximalist', 'Avant-garde', 'Classic', 'Romantic',
  'Futuristic', 'Streetwear', 'Couture', 'Tailoring', 'Deconstruction',
  'Bohemian', 'Glamour', 'Sporty', 'Utility', 'Heritage',
  'Artisanal', 'Industrial', 'Sculptural', 'Androgynous', 'Gender-fluid',
  'Opulent', 'Preppy', 'Punk', 'Grunge', 'Gothic',
  'Modernist', 'Postmodern', 'Baroque', 'Techwear', 'Sustainable',
  'Experimental', 'Monochrome', 'Print-driven', 'Logo-centric', 'Architectural',
  'Fluid', 'Structured', 'Raw', 'Polished', 'Conceptual',
  'Provocative', 'Feminine', 'Masculine', 'Eclectic', 'Refined',
  'Youthful', 'Retro', 'Luxury', 'Accessible', 'Performance',
]

// ── Bidirectional related-tag helpers ────────────────────────────────────────

/** Add `inverseTag` to the `related_tags` of the entity identified by `targetTag` (e.g. "designer:gucci"). */
async function addTagToEntity(targetTag: string, inverseTag: string): Promise<void> {
  const colonIdx = targetTag.indexOf(':')
  if (colonIdx === -1) return
  const type = targetTag.slice(0, colonIdx)
  const slug = targetTag.slice(colonIdx + 1)
  if (type !== 'designer' && type !== 'style' && type !== 'trend') return
  const table = type === 'designer' ? 'designers' : type === 'style' ? 'styles' : 'trends'
  const { results } = await query(`SELECT related_tags FROM ${table} WHERE slug = ?`, [slug])
  if (!results[0]) return
  const current: string[] = JSON.parse((results[0].related_tags as string) || '[]')
  if (current.includes(inverseTag)) return
  await query(
    `UPDATE ${table} SET related_tags = ?, updated_at = datetime('now') WHERE slug = ?`,
    [JSON.stringify([...current, inverseTag]), slug],
  )
}

/** Remove `inverseTag` from the `related_tags` of the entity identified by `targetTag`. */
async function removeTagFromEntity(targetTag: string, inverseTag: string): Promise<void> {
  const colonIdx = targetTag.indexOf(':')
  if (colonIdx === -1) return
  const type = targetTag.slice(0, colonIdx)
  const slug = targetTag.slice(colonIdx + 1)
  if (type !== 'designer' && type !== 'style' && type !== 'trend') return
  const table = type === 'designer' ? 'designers' : type === 'style' ? 'styles' : 'trends'
  const { results } = await query(`SELECT related_tags FROM ${table} WHERE slug = ?`, [slug])
  if (!results[0]) return
  const current: string[] = JSON.parse((results[0].related_tags as string) || '[]')
  if (!current.includes(inverseTag)) return
  await query(
    `UPDATE ${table} SET related_tags = ?, updated_at = datetime('now') WHERE slug = ?`,
    [JSON.stringify(current.filter((t) => t !== inverseTag)), slug],
  )
}

/**
 * Diff oldTags → newTags and mirror every change on the target entities.
 * sourceType + sourceSlug identify the entity being saved (e.g. 'designer', 'acne-studios').
 */
async function syncBidirectionalTags(
  sourceType: 'designer' | 'style' | 'trend',
  sourceSlug: string,
  oldTags: string[],
  newTags: string[],
): Promise<void> {
  const inverseTag = `${sourceType}:${sourceSlug}`
  const added = newTags.filter((t) => !oldTags.includes(t))
  const removed = oldTags.filter((t) => !newTags.includes(t))
  await Promise.all([
    ...added.map((t) => addTagToEntity(t, inverseTag)),
    ...removed.map((t) => removeTagFromEntity(t, inverseTag)),
  ])
}

// ─────────────────────────────────────────────────────────────────────────────

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
    related_tags: JSON.parse((row.related_tags as string) || '[]'),
  }
}

function parseTrendRow(row: TrendRow | undefined): Trend | null {
  if (!row) return null
  return {
    ...row,
    designer_slugs: JSON.parse((row.designer_slugs as string) || '[]'),
    preview_images: JSON.parse((row.preview_images as string) || '[]'),
    images: JSON.parse((row.images as string) || '[]'),
    products: JSON.parse((row.products as string) || '[]'),
    related_tags: JSON.parse((row.related_tags as string) || '[]'),
  }
}

function parseProductRow(row: ProductRow | undefined): Product | null {
  if (!row) return null
  return {
    ...row,
    images: JSON.parse((row.images as string) || '[]'),
    retailers: JSON.parse((row.retailers as string) || '[]'),
  }
}

function parseColorRow(row: ColorRow | undefined): Color | null {
  if (!row) return null
  return {
    ...row,
    images: JSON.parse((row.images as string) || '[]'),
    products: JSON.parse((row.products as string) || '[]'),
    related_tags: JSON.parse((row.related_tags as string) || '[]'),
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
          known_for_tags, eras, signature_pieces, related_tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, slug, data.phonetic || '', data.audio_url || '',
          data.origin_meaning || '', data.hero_image_url || '',
          data.founder || '', data.founded_year || '',
          data.origin_location || '', data.creative_director || '',
          JSON.stringify(data.known_for_tags || []),
          JSON.stringify(data.eras || []),
          JSON.stringify(data.signature_pieces || []),
          JSON.stringify(data.related_tags || []),
        ],
      )
      if (data.related_tags?.length) {
        await syncBidirectionalTags('designer', slug, [], data.related_tags)
      }
      return meta
    },
    async update(id: string | number, data: DesignerInput) {
      // Sync bidirectional tags before saving
      if (data.related_tags !== undefined) {
        const { results } = await query('SELECT slug, related_tags FROM designers WHERE id = ?', [id])
        const row = results[0]
        if (row) {
          const slug = row.slug as string
          const oldTags: string[] = JSON.parse((row.related_tags as string) || '[]')
          await syncBidirectionalTags('designer', slug, oldTags, data.related_tags)
        }
      }

      const sets: string[] = []
      const params: unknown[] = []
      const fields = [
        'name', 'slug', 'phonetic', 'audio_url', 'origin_meaning',
        'hero_image_url', 'founder', 'founded_year', 'origin_location',
        'creative_director',
      ]
      const jsonFields = ['known_for_tags', 'eras', 'signature_pieces', 'related_tags']

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

  styles: {
    async list(): Promise<Style[]> {
      const { results } = await query(`
        SELECT
          k.id, k.name, k.slug, k.description, k.related_tags, k.created_at, k.updated_at,
          (SELECT COUNT(*) FROM designers d WHERE d.known_for_tags LIKE '%"' || k.name || '"%') AS designer_count
        FROM styles k
        ORDER BY k.name ASC
      `)
      return (results as unknown as (Style & { related_tags: string })[]).map((r) => ({
        ...r,
        related_tags: JSON.parse(r.related_tags || '[]'),
      }))
    },
    async getBySlug(slug: string): Promise<Style | null> {
      const { results } = await query(
        'SELECT * FROM styles WHERE slug = ?',
        [slug],
      )
      const row = results[0] as unknown as (Style & { related_tags: string }) | undefined
      if (!row) return null
      return { ...row, related_tags: JSON.parse(row.related_tags || '[]') }
    },
    async updateDescription(id: number, description: string) {
      const { meta } = await query(
        "UPDATE styles SET description = ?, updated_at = datetime('now') WHERE id = ?",
        [description, id],
      )
      return meta
    },
    async updateRelatedTags(id: number, related_tags: string[]) {
      const { results } = await query('SELECT slug, related_tags FROM styles WHERE id = ?', [id])
      const row = results[0]
      if (row) {
        const slug = row.slug as string
        const oldTags: string[] = JSON.parse((row.related_tags as string) || '[]')
        await syncBidirectionalTags('style', slug, oldTags, related_tags)
      }
      const { meta } = await query(
        "UPDATE styles SET related_tags = ?, updated_at = datetime('now') WHERE id = ?",
        [JSON.stringify(related_tags), id],
      )
      return meta
    },
    async relatedDesigners(styleName: string): Promise<Designer[]> {
      const { results } = await query(
        `SELECT * FROM designers WHERE known_for_tags LIKE ? ORDER BY name ASC`,
        [`%"${styleName}"%`],
      )
      return results.map((r) => parseDesignerRow(r as unknown as DesignerRow)!)
    },
    async relatedImages(styleName: string, limit = 20): Promise<{ url: string; entity_type: string; entity_slug: string }[]> {
      const { results } = await query(
        `SELECT url, entity_type, entity_slug FROM image_tags WHERE top_styles LIKE ? LIMIT ?`,
        [`%"${styleName}"%`, limit],
      )
      return results as unknown as { url: string; entity_type: string; entity_slug: string }[]
    },
    async relatedTrends(styleSlug: string): Promise<Trend[]> {
      const { results } = await query(
        `SELECT * FROM trends WHERE related_tags LIKE ? ORDER BY name ASC`,
        [`%"style:${styleSlug}"%`],
      )
      return results.map((r) => parseTrendRow(r as unknown as TrendRow)!)
    },
  },

  trends: {
    async list(): Promise<Trend[]> {
      const { results } = await query(
        'SELECT * FROM trends ORDER BY created_at DESC',
      )
      return results.map((r) => parseTrendRow(r as unknown as TrendRow)!)
    },
    async getById(id: string | number): Promise<Trend | null> {
      const { results } = await query(
        'SELECT * FROM trends WHERE id = ?',
        [id],
      )
      return parseTrendRow(results[0] as unknown as TrendRow)
    },
    async create(data: TrendInput) {
      const slug = data.slug || slugify(data.name)
      const images = data.images || []
      const preview_images = images.slice(0, 3)
      const { meta } = await query(
        `INSERT INTO trends (name, slug, context, designer_slugs, preview_images, images, products, related_tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, slug, data.context || '',
          JSON.stringify(data.designer_slugs || []),
          JSON.stringify(preview_images),
          JSON.stringify(images),
          JSON.stringify(data.products || []),
          JSON.stringify(data.related_tags || []),
        ],
      )
      if (data.related_tags?.length) {
        await syncBidirectionalTags('trend', slug, [], data.related_tags)
      }
      return meta
    },
    async update(id: string | number, data: TrendInput) {
      // Sync bidirectional tags before saving
      if (data.related_tags !== undefined) {
        const { results } = await query('SELECT slug, related_tags FROM trends WHERE id = ?', [id])
        const row = results[0]
        if (row) {
          const slug = row.slug as string
          const oldTags: string[] = JSON.parse((row.related_tags as string) || '[]')
          await syncBidirectionalTags('trend', slug, oldTags, data.related_tags)
        }
      }

      const images = data.images || []
      const preview_images = images.slice(0, 3)
      const { meta } = await query(
        `UPDATE trends SET
          name = ?, context = ?, designer_slugs = ?, preview_images = ?,
          images = ?, products = ?, related_tags = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [
          data.name, data.context || '',
          JSON.stringify(data.designer_slugs || []),
          JSON.stringify(preview_images),
          JSON.stringify(images),
          JSON.stringify(data.products || []),
          JSON.stringify(data.related_tags || []),
          id,
        ],
      )
      return meta
    },
    async delete(id: number) {
      const { meta } = await query('DELETE FROM trends WHERE id = ?', [id])
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

  colors: {
    async list(): Promise<Color[]> {
      const { results } = await query('SELECT * FROM colors ORDER BY name ASC')
      return results.map((r) => parseColorRow(r as unknown as ColorRow)!)
    },
    async getById(id: string | number): Promise<Color | null> {
      const { results } = await query('SELECT * FROM colors WHERE id = ?', [id])
      return parseColorRow(results[0] as unknown as ColorRow)
    },
    async create(data: ColorInput) {
      const slug = data.slug || slugify(data.name)
      const { meta } = await query(
        `INSERT INTO colors (name, slug, hex, description, main_image_url, images, products, related_tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, slug, data.hex || '', data.description || '',
          data.main_image_url || '',
          JSON.stringify(data.images || []),
          JSON.stringify(data.products || []),
          JSON.stringify(data.related_tags || []),
        ],
      )
      return meta
    },
    async update(id: string | number, data: ColorInput) {
      const sets: string[] = []
      const params: unknown[] = []
      const fields = ['name', 'slug', 'hex', 'description', 'main_image_url']
      const jsonFields = ['images', 'products', 'related_tags']

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
      const { meta } = await query(`UPDATE colors SET ${sets.join(', ')} WHERE id = ?`, params)
      return meta
    },
    async delete(id: number) {
      const { meta } = await query('DELETE FROM colors WHERE id = ?', [id])
      return meta
    },
  },

  products: {
    async list(): Promise<Product[]> {
      const { results } = await query(`
        SELECT p.*,
          COALESCE(d.name, p.designer_name) AS resolved_designer_name,
          t.name AS trend_name
        FROM products p
        LEFT JOIN designers d ON p.designer_id = d.id
        LEFT JOIN trends t ON p.trend_id = t.id
        ORDER BY p.created_at DESC
      `)
      return results.map((r) => parseProductRow(r as unknown as ProductRow)!)
    },
    async getById(id: string | number): Promise<Product | null> {
      const { results } = await query(`
        SELECT p.*,
          COALESCE(d.name, p.designer_name) AS resolved_designer_name,
          t.name AS trend_name
        FROM products p
        LEFT JOIN designers d ON p.designer_id = d.id
        LEFT JOIN trends t ON p.trend_id = t.id
        WHERE p.id = ?
      `, [id])
      return parseProductRow(results[0] as unknown as ProductRow)
    },
    async create(data: ProductInput) {
      const slug = data.slug || slugify(data.name)
      const { meta } = await query(
        `INSERT INTO products (name, slug, brand, image_url, images, designer_id, designer_name, trend_id, section, cheapest_price, retailers)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, slug, data.brand || '', data.image_url || '',
          JSON.stringify(data.images || []),
          data.designer_id ?? null, data.designer_name || '',
          data.trend_id ?? null,
          data.section || '',
          data.cheapest_price || '',
          JSON.stringify(data.retailers || []),
        ],
      )
      return meta
    },
    async update(id: string | number, data: ProductInput) {
      const { meta } = await query(
        `UPDATE products SET
          name = ?, brand = ?, image_url = ?, images = ?,
          designer_id = ?, designer_name = ?, trend_id = ?,
          section = ?, cheapest_price = ?, retailers = ?,
          updated_at = datetime('now')
         WHERE id = ?`,
        [
          data.name, data.brand || '', data.image_url || '',
          JSON.stringify(data.images || []),
          data.designer_id ?? null, data.designer_name || '',
          data.trend_id ?? null,
          data.section || '',
          data.cheapest_price || '',
          JSON.stringify(data.retailers || []),
          id,
        ],
      )
      return meta
    },
    async delete(id: number) {
      const { meta } = await query('DELETE FROM products WHERE id = ?', [id])
      return meta
    },
  },

  imageTags: {
    async list(entityType?: string, limit = 50, offset = 0): Promise<ImageTag[]> {
      const where = entityType ? `WHERE entity_type = '${entityType}'` : '';
      const { results } = await query(
        `SELECT url_hash, url, entity_type, entity_id, entity_slug, role, top_styles, tagged_at
         FROM image_tags ${where} ORDER BY tagged_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
      );
      return (results as unknown as ImageTagRow[]).map((r) => ({
        ...r,
        top_styles: JSON.parse(r.top_styles || '[]'),
      }));
    },
    async count(entityType?: string): Promise<number> {
      const where = entityType ? `WHERE entity_type = '${entityType}'` : '';
      const { results } = await query(`SELECT COUNT(*) AS n FROM image_tags ${where}`);
      return (results[0] as unknown as { n: number }).n;
    },
    async updateTags(urlHash: string, topStyles: string[]) {
      await query('DELETE FROM image_tag_items WHERE url_hash = ?', [urlHash]);
      await query(
        "UPDATE image_tags SET top_styles = ?, tagged_at = datetime('now') WHERE url_hash = ?",
        [JSON.stringify(topStyles), urlHash],
      );
      for (const tag of topStyles) {
        await query('INSERT OR REPLACE INTO image_tag_items (url_hash, tag) VALUES (?, ?)', [urlHash, tag]);
      }
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

interface ImageTagRow {
  url_hash: string;
  url: string;
  entity_type: string;
  entity_id: number;
  entity_slug: string;
  role: string;
  top_styles: string;
  tagged_at: string;
}

interface ImageTag extends Omit<ImageTagRow, 'top_styles'> {
  top_styles: string[];
}

export default adminApi
export { slugify }
export type {
  Color, ColorInput, ColorProduct, ColorRow,
  Designer, DesignerInput, DesignerRequest, DesignerRow, Era, Style,
  ImageTag, ImageTagRow,
  Piece, Product, ProductInput, ProductRow, Retailer,
  StatCounts, Tag, Trend, TrendInput, TrendProduct, User,
}
