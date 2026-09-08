# Bloque Base — guía paso a paso (para empezar desde cero)

Esto son 4 fases. No necesitas saber programar, solo seguir los pasos en orden.

---

## FASE 1 — Poner el proyecto en GitHub (donde vive el "robot")

GitHub es donde va a estar guardado tu código y desde donde el robot se ejecutará solo cada hora.

1. Ve a [github.com](https://github.com) y crea una cuenta gratis (si no tienes).
2. Arriba a la derecha, pulsa el **+** → **New repository**.
3. Ponle un nombre, por ejemplo `bloque-base`. Déjalo en **Public**. No marques ninguna casilla extra. Pulsa **Create repository**.
4. En la página del repositorio recién creado, verás un enlace que dice **"uploading an existing file"**. Púlsalo.
5. Arrastra ahí **todos los archivos y carpetas** que te he generado (mantén la estructura de carpetas tal cual: `data/`, `scripts/`, `.github/`, etc.). Si tu navegador te permite arrastrar la carpeta entera, mejor.
6. Abajo, pulsa **Commit changes**.

Con esto, tu código ya está en GitHub.

### Activar el robot

7. En tu repositorio, ve a la pestaña **Actions**.
8. Verás el workflow "Actualizar noticias cripto". Si GitHub te pregunta si quieres habilitar Actions, di que sí.
9. Para probarlo ya mismo sin esperar una hora: entra en ese workflow y pulsa el botón **Run workflow** → **Run workflow**. Espera 1-2 minutos y recarga — debería aparecer un ✅ verde. Eso significa que ya descargó noticias reales y las guardó en `data/news.json`.

A partir de aquí, se ejecutará solo cada hora, para siempre, gratis, sin que tengas que hacer nada.

---

## FASE 2 — Publicar la web (Netlify)

1. Ve a [netlify.com](https://netlify.com) → **Sign up** → elige "Sign up with GitHub" (así quedan conectados automáticamente).
2. Una vez dentro, pulsa **Add new site** → **Import an existing project**.
3. Elige **GitHub** y selecciona el repositorio `bloque-base`.
4. En "Build settings" no toques nada (no hace falta comando de build, es una web estática) → pulsa **Deploy**.
5. En 1-2 minutos te dará una URL tipo `https://algo-random-123.netlify.app` — esa ya es tu web pública, funcionando.

**Importante:** cada vez que el robot actualice `data/news.json` en GitHub (cada hora), Netlify **redeploya solo automáticamente**. No tienes que tocar nada nunca más.

### (Opcional) Dominio propio

6. En Netlify, ve a **Domain settings** → **Add a domain**.
7. Si aún no tienes un dominio, cómpralo en [namecheap.com](https://namecheap.com) o similar (unos 8-12€/año).
8. Netlify te da unos registros DNS que tienes que pegar en la configuración de tu dominio (Namecheap tiene un tutorial propio para esto — te lo pedirán solos al conectar).

---

## FASE 3 — Revisar que todo funciona

1. Abre tu URL de Netlify.
2. Deberías ver ya noticias reales (no las de ejemplo) si ejecutaste el paso 9 de la Fase 1.
3. Prueba los filtros de categoría (Bitcoin, Ethereum, Regulación...) arriba.
4. Espera a la siguiente hora en punto y recarga — verás que las noticias más recientes aparecen solas.

---

## FASE 4 — Solicitar Google AdSense

Google exige que tu web tenga **contenido real y suficiente** antes de aprobarte, así que dale un par de días para acumular noticias antes de solicitar.

1. Ve a [adsense.google.com](https://adsense.google.com) y crea una cuenta con tu dominio (el de Netlify o el propio si lo compraste).
2. Google te dará un código de verificación (un `<script>`). Pégalo en `index.html`, justo donde pone:
   ```html
   <!-- HUECO PARA GOOGLE ADSENSE... -->
   ```
3. Sube ese cambio a GitHub (edítalo directamente en la web de GitHub, botón del lápiz ✏️ sobre el archivo, y "Commit changes"). Netlify lo publicará solo.
4. Espera la revisión de Google (puede tardar de 1 día a 2 semanas).
5. Una vez aprobado, Google te dará **bloques de anuncio** (ad units). Pega ese código donde pone:
   ```html
   <!-- HUECO ANUNCIO 1... -->
   ```
   en `index.html`.
6. Google también te pedirá crear un archivo `ads.txt` en la raíz del sitio — créalo con el contenido exacto que te indiquen a través de GitHub, igual que en el paso 3.

---

## Cómo personalizar más adelante

- **Cambiar fuentes de noticias:** edita la lista `FEEDS` en `scripts/fetch-news.js`.
- **Cambiar categorías:** edita `TAG_RULES` en el mismo archivo.
- **Cambiar colores/tipografía:** todo está centralizado en las variables `:root` al principio de `styles.css`.
- **Resúmenes más elaborados (con IA de verdad):** cuando quieras, podemos sustituir la función `quickTake()` del script por una llamada a la API de Claude para que cada noticia lleve un análisis más rico. Esto tiene un coste pequeño por uso (no es gratis como el resto del sistema), así que lo dejamos como mejora opcional para cuando el sitio ya tenga tráfico.

## Nota legal importante

Este sitio muestra siempre **titular + resumen corto + enlace a la fuente original**, nunca el artículo completo. Eso es lo que lo hace legal y lo que espera Google de un sitio agregador. No elimines los enlaces a la fuente ni amplíes los resúmenes copiando texto literal de los medios originales.
