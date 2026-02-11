// Cloudflare bindings environment

export interface Env {
  DB: D1Database;
  ASSETS_BUCKET: R2Bucket;
  SITE_SECRET?: string;
  SWANKK_JWT_SECRET?: string;
}

/** JWT payload set by middleware on context.data */
export interface JwtUser {
  sub: number;
  email: string;
  exp: number;
}

/** Shape of context.data populated by the _middleware handler */
export type CFData = Record<string, unknown> & { user?: JwtUser | null };
