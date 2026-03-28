-- SWANKK D1 Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS designers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phonetic TEXT NOT NULL DEFAULT '',
  audio_url TEXT DEFAULT '',
  origin_meaning TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  founder TEXT DEFAULT '',
  founded_year TEXT DEFAULT '',
  origin_location TEXT DEFAULT '',
  creative_director TEXT DEFAULT '',
  known_for_tags TEXT DEFAULT '[]',
  eras TEXT DEFAULT '[]',
  signature_pieces TEXT DEFAULT '[]',
  related_tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  share_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saved_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  owner_email TEXT NOT NULL,
  item_type TEXT DEFAULT '',
  designer_id INTEGER,
  title TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  external_url TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS designer_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  designer_name TEXT NOT NULL,
  email TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  context TEXT DEFAULT '',
  designer_slugs TEXT DEFAULT '[]',
  preview_images TEXT DEFAULT '[]',
  images TEXT DEFAULT '[]',
  products TEXT DEFAULT '[]',
  related_tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS styles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  related_tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the closed styles list (fashion aesthetic concepts)
INSERT OR IGNORE INTO styles (name, slug) VALUES
  ('Louis Vuitton', 'louis-vuitton'),
  ('Chanel', 'chanel'),
  ('Dior', 'dior'),
  ('Gucci', 'gucci'),
  ('Prada', 'prada'),
  ('Saint Laurent', 'saint-laurent'),
  ('Balenciaga', 'balenciaga'),
  ('Versace', 'versace'),
  ('Bottega Veneta', 'bottega-veneta'),
  ('Schiaparelli', 'schiaparelli'),
  ('Alaïa', 'alaia'),
  ('Fendi', 'fendi'),
  ('Valentino', 'valentino'),
  ('Burberry', 'burberry'),
  ('Loewe', 'loewe'),
  ('Givenchy', 'givenchy'),
  ('Chloé', 'chloe'),
  ('Miu Miu', 'miu-miu'),
  ('Acne Studios', 'acne-studios'),
  ('Jacquemus', 'jacquemus'),
  ('Maison Margiela', 'maison-margiela'),
  ('Tom Ford', 'tom-ford'),
  ('Ralph Lauren', 'ralph-lauren'),
  ('Dolce & Gabbana', 'dolce-gabbana'),
  ('Mugler', 'mugler'),
  ('Vivienne Westwood', 'vivienne-westwood'),
  ('Stella McCartney', 'stella-mccartney'),
  ('Issey Miyake', 'issey-miyake'),
  ('Rick Owens', 'rick-owens'),
  ('JW Anderson', 'jw-anderson'),
  ('Celine', 'celine'),
  ('Jil Sander', 'jil-sander'),
  ('Dries Van Noten', 'dries-van-noten'),
  ('Thom Browne', 'thom-browne'),
  ('Ferragamo', 'ferragamo'),
  ('Marc Jacobs', 'marc-jacobs'),
  ('Coach', 'coach'),
  ('Jean Paul Gaultier', 'jean-paul-gaultier'),
  ('Kenzo', 'kenzo'),
  ('Max Mara', 'max-mara'),
  ('Brunello Cucinelli', 'brunello-cucinelli'),
  ('The Row', 'the-row'),
  ('Alexander McQueen', 'alexander-mcqueen'),
  ('Coperni', 'coperni'),
  ('Courrèges', 'courreges'),
  ('Giorgio Armani', 'giorgio-armani'),
  ('Isabel Marant', 'isabel-marant'),
  ('Marni', 'marni'),
  ('Hermès', 'hermes');

CREATE TABLE IF NOT EXISTS colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hex TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  main_image_url TEXT DEFAULT '',
  images TEXT DEFAULT '[]',
  products TEXT DEFAULT '[]',
  related_tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS image_tags (
  url_hash  TEXT PRIMARY KEY,            -- md5(url), 32-char hex — matches image_cache filename
  url       TEXT NOT NULL,
  entity_type TEXT NOT NULL,             -- 'designer' | 'trend' | 'color'
  entity_id   INTEGER NOT NULL,
  entity_slug TEXT NOT NULL,
  role        TEXT DEFAULT '',           -- 'hero' | 'era' | 'trend' | 'product'
  top_styles  TEXT NOT NULL DEFAULT '[]', -- JSON array  ["Prada", "Chanel", ...]
  all_scores  TEXT NOT NULL DEFAULT '{}', -- JSON object {"prada": 0.12, ...}
  tagged_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_image_tags_entity ON image_tags(entity_type, entity_id);

-- Normalized tag rows — one per (image, tag) — powers fast similarity queries.
CREATE TABLE IF NOT EXISTS image_tag_items (
  url_hash TEXT NOT NULL REFERENCES image_tags(url_hash) ON DELETE CASCADE,
  tag      TEXT NOT NULL,
  PRIMARY KEY (url_hash, tag)
);

CREATE INDEX IF NOT EXISTS idx_image_tag_items_tag ON image_tag_items(tag);

CREATE TABLE IF NOT EXISTS bookmarks (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category  TEXT NOT NULL,                        -- 'images' | 'designers' | 'products' | 'styles'
  item_id   TEXT NOT NULL,
  data      TEXT NOT NULL DEFAULT '{}',           -- JSON snapshot of the bookmark payload
  saved_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, category, item_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id, category);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  images TEXT DEFAULT '[]',
  designer_id INTEGER,
  designer_name TEXT DEFAULT '',
  trend_id INTEGER,
  section TEXT DEFAULT '',
  cheapest_price TEXT DEFAULT '',
  retailers TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_designer ON products(designer_id);
CREATE INDEX IF NOT EXISTS idx_products_trend ON products(trend_id);
CREATE INDEX IF NOT EXISTS idx_products_section ON products(section);

-- Migration history (already applied to remote DB):
-- CREATE TABLE IF NOT EXISTS products (...) + indexes -- run schema.sql products block against D1
-- ALTER TABLE keywords RENAME TO styles;
-- ALTER TABLE trends DROP COLUMN keywords;
-- ALTER TABLE designers ADD COLUMN related_tags TEXT NOT NULL DEFAULT '[]';
-- ALTER TABLE styles ADD COLUMN related_tags TEXT NOT NULL DEFAULT '[]';
-- ALTER TABLE trends ADD COLUMN related_tags TEXT NOT NULL DEFAULT '[]';
-- CREATE TABLE IF NOT EXISTS colors (...) -- run schema.sql colors block against D1
