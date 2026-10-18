# Casa Chipa Andorra

One-page site for Casa Chipa. Plain HTML, CSS and JavaScript, no build step.

## Before launch

Open `app.js` and change the three values at the top:

- `whatsapp`: your number with country code, digits only (Andorra is 376).
- `pricePerBag`: price in euros for a bag of 12.
- `instagram`: your Instagram URL.

## Editing text

All copy lives in `i18n.js`, one block per language (es, ca, en).
Change a sentence there and it updates on the page.

## Running locally

Any static server works, for example:

    python3 -m http.server 8000

Then open http://localhost:8000

## Deploying

The whole folder is the site. Drag it into Vercel or Netlify, or push it to a
GitHub repo and turn on GitHub Pages. The `casachipa-imag` folder holds the
original brand images and is not needed on the server.

## Image credits

`assets/andorra.jpg`: Vall d'Incles, Andorra. Photo by Austral Lights, licensed
CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0), cropped.
Source: Wikimedia Commons.
