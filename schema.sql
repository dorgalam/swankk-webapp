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
