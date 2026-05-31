# GitHub Pages Deploy

The project is Vite-built with `base: "./"`, so images and bundled files work from a GitHub Pages subpath.

## Option A: upload built files

1. Run `npm install`.
2. Run `npm run build`.
3. Upload everything inside `github-pages-ready` to a GitHub repository.
4. In GitHub: Settings -> Pages -> Deploy from branch.
5. Select the branch and root folder.

## Option B: upload source project

1. Upload the full project folder.
2. In GitHub Actions or locally, run:

```powershell
npm install
npm run build
```

3. Publish the generated `dist` folder.

## Notes

- Static assets live under `public/game`, including the first `public/game/sve` assets copied from the local installed mod.
- `.nojekyll` is included in `github-pages-ready`.
- Local checklist saves use browser `localStorage`; they are per-browser and do not require a server.
