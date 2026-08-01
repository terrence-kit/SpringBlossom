# Spring Blossom Resto Bar — one-page static website

Open `index.html` in a browser. No build step or framework is required.

## Images currently used

The website uses the real files already supplied in the project folder:

- `INTERIOR.png` — hero and interior image
- `FOOD_1.png` and `FOOD_2.png` — featured food images with a hover transition
- `COCKTAIL.png` — featured cocktail image
- `11 (3).png` through `18 (3).png` — full menu pages

If an individual menu image is missing, that menu card removes itself automatically.

## QR codes

The website uses the supplied QR images from the project folder:

- `WEBSITE QR.png`
- `FACEBOOK QR.png`
- `INSTAGRAM QR.png`

If one is missing, only that QR card removes itself automatically.

## Edit details

- Menu and page content: `index.html`
- Colors, layout, and effects: `styles.css`
- Menu tabs, petals, reveals, and mobile navigation: `script.js`

## Admin page on Vercel

The footer's former **Back to top** link now opens `admin.html`. The admin page can edit
`index.html` and replace the website's current PNG images. Each save creates a GitHub
commit; a Vercel project connected to that repository will then redeploy automatically.

### One-time setup

1. Put this project in a GitHub repository and import that repository into Vercel.
2. Create a fine-grained GitHub personal access token with **Contents: Read and write**
   access to only that repository.
3. In Vercel, open **Project Settings → Environment Variables** and add:

   - `ADMIN_USERNAME` — the username used on the admin page
   - `ADMIN_PASSWORD` — a strong password used on the admin page
   - `SESSION_SECRET` — a long random value used to sign login sessions
   - `GITHUB_TOKEN` — the fine-grained token from step 2
   - `GITHUB_REPO` — repository name in `owner/repository` form
   - `GITHUB_BRANCH` — deployment branch, normally `main` (optional; defaults to `main`)

4. Apply the variables to Production (and Preview if desired), then redeploy once.

Never place the username, password, session secret, or GitHub token directly in an HTML
or browser JavaScript file. The API verifies them server-side using Vercel environment
variables. The HTML editor is not populated until those credentials are verified. Image
replacements must be PNG files no larger than 3 MB.
