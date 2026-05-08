# Deploy

Live site:

https://baditaflorin.github.io/urban-farm-year/

Repository:

https://github.com/baditaflorin/urban-farm-year

## Publishing

GitHub Pages serves the `main` branch `/docs` directory.

To publish manually:

```sh
make data
make build
git add public/data docs
git commit -m "chore: publish pages build"
git push
```

## Rollback

Revert the publishing commit and push:

```sh
git revert <commit_sha>
git push
```

## Custom Domain

No custom domain is configured in v1. If one is added later, create `docs/CNAME` with the domain and configure DNS according to GitHub Pages documentation:

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
