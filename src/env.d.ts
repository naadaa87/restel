/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type Env = {
  DB: D1Database;
  MEDIA?: R2Bucket;
  ASSETS: Fetcher;
  SITE_URL?: string;
  DEFAULT_LOCALE?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET?: string;
};

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    lang: string;
    host?: { id: number; email: string; name: string; status: string };
    admin?: { email: string };
  }
}
