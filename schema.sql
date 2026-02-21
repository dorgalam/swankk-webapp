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
  keywords TEXT DEFAULT '[]',
  products TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the closed keywords list (49 designer names)
INSERT OR IGNORE INTO keywords (name, slug) VALUES
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

-- Run these ALTER TABLE statements on existing DBs:
-- ALTER TABLE trends ADD COLUMN keywords TEXT DEFAULT '[]';
-- ALTER TABLE trends ADD COLUMN products TEXT DEFAULT '[]';
