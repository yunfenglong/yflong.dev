---
title: "Introduction to Static Site Hosting"
summary: "A practical guide to deploying a static website with GitHub Pages or Cloudflare Pages, plus optional CI/CD automation with GitHub Actions."
date: "2025-08-01"
tags: github actions,deployment,tutorial
published: true
---
## Prerequisites

Before you start, you only need two things:

- A GitHub account. If you do not have one, sign up at [github.com/signup](https://github.com/signup).
- A simple website project on your machine.

If you are starting from scratch, create `my-first-website/index.html` with this file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My First Website</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: grid;
      place-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f0f2f5;
      color: #333;
      text-align: center;
    }

    h1 {
      color: #1c1e21;
      font-size: 2.5rem;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <h1>Hello, World! My website is live!</h1>
  <p>Hosted with love by GitHub and Cloudflare.</p>
</body>
</html>
```

## Deploy With GitHub Pages

GitHub Pages is the simplest option for getting your first static site online.

### 1. Create a repository

- In GitHub, click `+` and choose `New repository`.
- Use a name like `my-first-website`.
- Set it to `Public` if you use the free GitHub Pages setup.
- Create the repo.

### 2. Upload your site files

- In the repo, click `Add file` -> `Upload files`.
- Upload `index.html` (or your project files).
- Commit with a message like `feat: add initial website files`.

### 3. Enable Pages

- Open `Settings` -> `Pages`.
- Under `Build and deployment`, choose `Deploy from a branch`.
- Set branch to `main` and folder to `/(root)`.
- Click `Save`.

### 4. Open your live URL

GitHub will publish to:

`https://<your-github-username>.github.io/<your-repository-name>/`

If you see a 404 at first launch, wait a few minutes and refresh.

## Deploy With Cloudflare Pages

Cloudflare Pages gives faster global delivery and a clean Git-based workflow.

### 1. Create a Cloudflare account

Sign up at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).

### 2. Connect Cloudflare Pages to GitHub

- Open Cloudflare dashboard.
- Go to `Workers & Pages` -> `Create application` -> `Pages` -> `Connect to Git`.
- Authorize GitHub and select your repository.

### 3. Configure build settings

For a plain HTML/CSS/JS website:

- Framework preset: `None`
- Build command: leave blank
- Build output directory: leave blank or `/`

Then click `Save and Deploy`.

### 4. Open your Cloudflare URL

Your site will be available at:

`https://<project-name>.pages.dev`

## Automate Deployment With GitHub Actions

Manual uploads are fine initially. For long-term maintainability, automate deployment with CI/CD.

Create `.github/workflows/deploy.yml`:

```yaml
name: deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Dependencies
        run: npm ci

      - name: Build VuePress site
        run: npm run docs:build

      - name: Deploy to GitHub Pages
        uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: gh-pages
          build_dir: docs/.vuepress/dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Commit and push:

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for deployment"
git push
```

Then set GitHub Pages source to the `gh-pages` branch.

## Q&A and Troubleshooting

### Why am I seeing 404 Not Found?

- Wait 5 to 10 minutes after first deployment.
- Ensure your entry file is `index.html`.
- Confirm the deployment branch/folder is correct.
- For free GitHub Pages, ensure repository visibility is `Public`.

### Why are CSS or JavaScript files not loading?

- Check path correctness in `href` and `src`.
- Check filename case sensitivity.
- If using a framework, inspect CI build logs.

### How do I use a custom domain?

- GitHub Pages: set custom domain under `Settings` -> `Pages`, then add DNS records at your registrar.
- Cloudflare Pages: use the `Custom domains` flow in your project.

### Which should I choose?

- GitHub Pages for simplicity and quick setup.
- Cloudflare Pages for stronger performance and edge-network delivery.
