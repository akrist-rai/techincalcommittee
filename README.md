# Technical Committee — standalone site

A small React + Vite landing page for the Technical Committee, decoupled from
the main Ephemeral app. Its only job is to look good and point people at
[ephemeral-v2-1.vercel.app](https://ephemeral-v2-1.vercel.app).

## Uploading to GitHub (web UI, no git command line)

1. Go to [github.com/new](https://github.com/new) and create a new **empty**
   repository (don't check "Add a README" — you're uploading your own files).
2. Open the new repo, click **Add file → Upload files**.
3. Drag in everything from this `committee-site` folder **except**:
   - `node_modules/` — never upload this, it's huge and gets reinstalled automatically
   - `dist/` — this is a local build output, Vercel builds its own copy
   - `package-lock.json` is fine to include (recommended, keeps installs reproducible)

   So you should be dragging: `public/`, `src/`, `index.html`, `package.json`,
   `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`.
4. Scroll down, write a commit message (e.g. "initial commit"), and click
   **Commit changes**.

Tip: if your browser lets you drag a whole folder at once, you can drag the
`public` folder and `src` folder in directly — GitHub's upload page preserves
folder structure. `node_modules` and `dist` are the only two to leave out.

## Deploying to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in.
2. Click **Import** next to the GitHub repo you just created.
3. Vercel auto-detects the **Vite** framework preset — build command
   `vite build`, output directory `dist`. You shouldn't need to change anything.
4. Click **Deploy**. A couple minutes later you'll have a live URL like
   `your-repo-name.vercel.app`.

Want a custom domain instead of the `*.vercel.app` one? Add it afterwards
under the project's **Settings → Domains**.

## Before you deploy

The "Enter Ephemeral" / "Apply to Join" buttons point at
`https://ephemeral-v2-1.vercel.app`, hardcoded as `EPHEMERAL_URL` at the top
of [`src/App.tsx`](src/App.tsx). Double-check that URL is actually live
before you publicize this page — if it's wrong, change it there and re-upload
(or just edit the file directly on GitHub and Vercel will redeploy
automatically).

## Testing locally first (optional)

```bash
npm install
npm run dev       # http://localhost:5175
npm run build     # production build into dist/
npm run preview   # serve that build locally to sanity-check it
```
