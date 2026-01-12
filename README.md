# calculadora de impuestos

Calculadora de impuestos para calcular el total a cobrar desde la base imponible o la base imponible desde el total (IVA e IRPF).

## Características

- **Base imponible**: Input para introducir la cantidad base en euros
- **Total a cobrar**: Input para calcular en modo inverso desde el total
- **IVA**: Porcentaje de IVA (solo números enteros) con activación/desactivación mediante botón toggle (activo por defecto)
- **IRPF**: Porcentaje de IRPF (solo números enteros) con activación/desactivación mediante botón toggle (desactivado por defecto)
- **Resultado en tiempo real**: Muestra el desglose y el total a cobrar

## Uso

Simplemente abre `index.html` en tu navegador. Puedes introducir la base imponible o el total a cobrar y el otro campo se recalcula automáticamente.

### IVA e IRPF

El IVA está activado por defecto y se puede desactivar con su botón de toggle (✓/✗). El IRPF está desactivado por defecto y se activa con su toggle al lado del input.

## SEO y publicación

Este proyecto incluye configuración SEO básica sin alterar la interfaz.

### Archivos SEO incluidos

- `sitemap.xml`: lista de URLs para indexación (se envía en Search Console).
- `robots.txt`: referencia el sitemap para los bots.
- `og-image.png`: imagen 1200x630 para previsualizaciones en redes.
- `favicon/`: pack de iconos (favicon.ico, PNGs y apple-touch-icon).
- `google*.html`: archivo de verificación de Google Search Console (no lo borres).

### Cómo conseguirlos y para qué sirven

- **Google Search Console**: añade la propiedad con prefijo de URL, descarga el archivo HTML y súbelo a la raíz del repo. Sirve para verificar la propiedad e indexar el sitio.
- **Favicon pack**: genera el pack (por ejemplo con https://realfavicongenerator.net/) y coloca los archivos en `favicon/`. Sirve para iconos en pestañas, móviles y accesos directos.
- **OG image**: exporta una imagen 1200x630 y guárdala como `og-image.png`. Sirve para el preview al compartir la URL.

### Metadatos en `index.html`

Incluye `title`, `description`, `canonical`, Open Graph/Twitter y JSON‑LD para mejorar la indexación y el preview en redes. Si cambia la URL pública, actualiza el `canonical` y las URLs de las imágenes.

## Tecnologías

- HTML5
- CSS3
- JavaScript (vanilla)

## Créditos

Desarrollado por [meowrhino.studio](https://meowrhino.studio)
