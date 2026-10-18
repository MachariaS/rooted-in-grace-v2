// Server-only secrets. Read at request time so values set in Netlify's
// environment settings work without being baked into the build.
export function serverEnv(name: string): string {
  const value = process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}
