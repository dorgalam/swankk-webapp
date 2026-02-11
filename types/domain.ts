// Shared domain types for SWANKK

export interface Designer {
  id: number;
  name: string;
  slug: string;
  phonetic: string;
  audio_url: string;
  origin_meaning: string;
  hero_image_url: string;
  founder: string;
  founded_year: string;
  origin_location: string;
  creative_director: string;
  known_for_tags: string; // JSON string of string[]
  eras: string; // JSON string of Era[]
  signature_pieces: string; // JSON string of SignaturePiece[]
  created_at: string;
  updated_at: string;
}

export interface Era {
  name: string;
  years: string;
  description: string;
  image_url?: string;
}

export interface SignaturePiece {
  name: string;
  description: string;
  image_url?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  password?: string;
  created_at: string;
}

export interface Collection {
  id: number;
  name: string;
  owner_email: string;
  is_public: number;
  share_id: string | null;
  created_at: string;
}

export interface SavedItem {
  id: number;
  collection_id: number;
  owner_email: string;
  item_type: string;
  designer_id: number | null;
  title: string;
  image_url: string;
  subtitle: string;
  external_url: string;
  created_at: string;
}

export interface DesignerRequest {
  id: number;
  designer_name: string;
  email: string;
  status: string;
  created_at: string;
}

export interface UploadResponse {
  ok: boolean;
  key: string;
  url: string;
}

export interface Stats {
  designers: number;
  users: number;
  collections: number;
  saved_items: number;
  designer_requests: number;
}

export interface JwtPayload {
  email: string;
  full_name: string;
  iat: number;
  exp: number;
}

/** Raw designer row from D1 — JSON columns are strings */
export type DesignerRow = Designer;
