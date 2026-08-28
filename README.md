# Moment

属于你的陪伴空间。

## Local development

The static UI can run with `npm run dev`. Real chat requires a server runtime:

1. Copy `.env.example` to `.env.local`.
2. Set `DIFY_API_KEY` locally; never use a `VITE_*` variable for this secret.
3. Run the app with `npx vercel dev` so `/api/chat` is available.

## Hosting

GitHub Pages remains available for the static prototype, but it cannot execute
`/api/chat`. The Dify-enabled build must run on Vercel (or an equivalent server
runtime) with `DIFY_API_KEY` configured as a server-side environment variable.
