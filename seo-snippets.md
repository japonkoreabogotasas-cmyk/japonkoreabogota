# Snippets SEO pendientes de completar

## 1) Google Search Console (meta tag)
Reemplaza el valor en ambos archivos:
- `index.html`
- `pag_politica_seguridad_y_privacidad.html`

```html
<meta name="google-site-verification" content="REEMPLAZAR_CON_TOKEN_GSC">
```

## 2) Google Analytics 4 (GA4)
Pega antes de `</head>` en `index.html` y `pag_politica_seguridad_y_privacidad.html` y reemplaza `G-XXXXXXXXXX` por tu ID real.

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 3) Opcional: mover video pesado a CDN
Si migras `ruta-al-video.mp4` a Cloudinary (u otro CDN), actualiza el `src` del video en `index.html` y prueba LCP.
