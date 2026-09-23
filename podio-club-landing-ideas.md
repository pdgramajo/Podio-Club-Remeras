# Podio Club — Landing moderna con animaciones

## Objetivo

Diseñar la landing de **Podio Club** como una tienda de remeras moderna, visual y con personalidad de marca.

La idea es combinar tres referencias conceptuales:

- **OUTFIT** → estructura editorial, tipografía protagonista y presentación visual.
- **MOB LINKS** → personalidad, movimiento e identidad de marca.
- **Rainishop** → ecommerce claro, productos protagonistas y navegación sencilla.

No se busca copiar ninguna referencia. Se toman ideas visuales y de interacción para construir una identidad propia para Podio Club.

---

# Dirección visual

La landing debe sentirse como una **marca de ropa**, no como un catálogo genérico.

Principios:

- Diseño moderno y sobrio.
- Mucho espacio visual.
- Tipografía protagonista.
- Fotografías de las remeras como elemento principal.
- Animaciones suaves y con propósito.
- Mobile-first.
- Evitar efectos excesivos.
- La animación debe mejorar la presentación del producto, no convertirse en el protagonista.

> Una interacción bien hecha vale más que cinco efectos.

---

# Estructura de la landing

Orden recomendado:

1. Hero
2. Marquee / transición de marca
3. Nueva colección
4. Sección editorial / identidad
5. Producto destacado
6. Catálogo
7. CTA de compra por WhatsApp
8. Footer

---

# 1. Hero

El hero debe generar impacto inmediatamente.

Concepto:

```text
┌──────────────────────────────────────────────┐
│ PODIO CLUB                         🛒        │
│                                              │
│          VESTITE                             │
│          DISTINTO.                           │
│                                              │
│                    [ REMERA / FOTO ]         │
│                                              │
│             VER COLECCIÓN  →                 │
│                                              │
│                         ↓ SCROLL             │
└──────────────────────────────────────────────┘
```

## Animaciones

### Texto

El texto aparece suavemente desde abajo:

- `opacity: 0 → 1`
- `translateY: 30px → 0`

Primero aparece:

> VESTITE

Después:

> DISTINTO.

Con un pequeño delay entre ambos.

### Imagen

La imagen de la remera puede comenzar ligeramente ampliada:

```text
scale(1.08) → scale(1)
```

También puede tener un parallax muy suave durante el scroll.

### CTA

El botón:

> VER COLECCIÓN →

Debe tener un hover sutil.

No utilizar animaciones agresivas.

---

# 2. Marquee / transición de marca

Después del hero, introducir una sección de identidad inspirada en la sensación de movimiento de MOB LINKS.

Ejemplo:

```text
← PODIO CLUB / PODIO CLUB / PODIO CLUB / PODIO CLUB →
```

El texto puede desplazarse horizontalmente mientras el usuario hace scroll.

## Objetivo

Esta sección debe funcionar como una transición entre:

**Hero → Productos**

y reforzar el nombre de la marca.

El texto puede ser muy grande y ocupar buena parte de la pantalla.

---

# 3. Nueva colección

Después de la transición de marca aparece el catálogo principal.

Título:

> NUEVA COLECCIÓN

Ejemplo:

```text
┌─────────────┐  ┌─────────────┐
│             │  │             │
│   REMERA    │  │   REMERA    │
│             │  │             │
└─────────────┘  └─────────────┘

  PODIO #01         PODIO #02
  $25.000           $25.000
```

En desktop:

- 2 o 3 productos por fila.

En mobile:

- 1 producto por fila.

## Animaciones de las cards

Al entrar en viewport:

```text
opacity: 0 → 1
translateY: 30px → 0
```

Los productos pueden aparecer con un pequeño stagger.

### Hover

Estado normal:

```text
scale: 1
```

Hover:

```text
scale: 1.05
```

También puede aparecer:

> VER PRODUCTO →

El efecto debe ser rápido y suave.

---

# 4. Sección editorial / identidad

Esta sección rompe el catálogo y hace que el sitio se sienta como una marca.

Ejemplo:

```text
             PODIO CLUB

       NO ES SOLO UNA REMERA.

       ES LA FORMA EN QUE
       ELEGÍS VESTIRTE.

                         [ FOTO ]
```

## Animaciones

Los textos pueden entrar durante el scroll.

Ejemplo:

```text
NO ES SOLO UNA
```

entra desde la izquierda.

Después:

```text
REMERA.
```

aparece más grande.

La fotografía puede entrar con un fade + scale.

## Objetivo

Crear una pausa visual entre el catálogo y los productos destacados.

---

# 5. Producto destacado

Presentar una remera como protagonista.

Ejemplo:

```text
┌─────────────────────────────────────────────┐
│                                             │
│              PODIO #01                      │
│                                             │
│              ┌─────────┐                    │
│              │         │                    │
│              │ REMERA  │                    │
│              │         │                    │
│              └─────────┘                    │
│                                             │
│              NEGRO    BLANCO    ROJO        │
│                                             │
│                $25.000                      │
│                                             │
│             VER PRODUCTO →                  │
│                                             │
└─────────────────────────────────────────────┘
```

## Cambio de color

El modelo de producto ya contempla variantes.

Cada variante puede tener:

- talle
- color
- colorHex
- imágenes

Por ejemplo:

```text
product
   ↓
variant
   ├── size
   ├── color
   ├── colorHex
   └── images
```

Al seleccionar otro color:

- transición suave de la imagen
- pequeño scale
- cambio de fotografía correspondiente a la variante

No es necesario simular el color de una fotografía mediante CSS si ya existen imágenes específicas por variante.

---

# 6. Página de producto

Ruta:

```text
/producto/:slug
```

La página debe mantener la misma identidad visual de la landing.

Desktop:

```text
┌───────────────────────┬──────────────────────┐
│                       │                      │
│                       │   PODIO #01          │
│                       │                      │
│      FOTO GRANDE      │   Remera Oversize    │
│                       │                      │
│                       │   $25.000            │
│                       │                      │
│                       │   ● Negro            │
│                       │   ○ Blanco            │
│                       │   ○ Rojo             │
│                       │                      │
│                       │   S  M  L  XL        │
│                       │                      │
│                       │ [ AGREGAR AL CARRITO ]│
└───────────────────────┴──────────────────────┘
```

## Galería

Las thumbnails deben tener microinteracciones.

Al cambiar de imagen:

- fade
- pequeño slide
- transición suave

Evitar transiciones demasiado lentas.

---

# 7. Carrito

Ruta:

```text
/carrito
```

Debe ser simple y directo.

Ejemplo:

```text
CARRITO                         2

┌────────────────────────────────────┐
│ [foto]  PODIO #01                  │
│         Negro / M                  │
│         $25.000           − 1 +    │
└────────────────────────────────────┘

                  TOTAL
                  $25.000

             [ PAGAR POR WHATSAPP ]
```

## Animaciones

### Agregar producto

Cuando el usuario agrega una remera:

```text
AGREGAR
   ↓
producto
   ↓
entra visualmente al carrito
   ↓
🛒 0 → 🛒 1
```

El contador puede tener un pequeño scale:

```text
scale(1) → scale(1.2) → scale(1)
```

### Botón de WhatsApp

El CTA principal debe ser:

> PAGAR POR WHATSAPP →

Puede tener una animación muy sutil de hover.

---

# 8. Compra por WhatsApp

El checkout continúa siendo por WhatsApp.

El mensaje generado debería contener información clara del pedido.

Ejemplo:

```text
PODIO CLUB

Hola! Quiero comprar:

• Remera PODIO #01
• Color: Negro
• Talle: M
• Cantidad: 1

Total: $25.000
```

El sitio no necesita implementar un checkout tradicional.

---

# 9. Final de la landing

Cerrar nuevamente con una sección fuerte de marca.

Ejemplo:

```text
        PODIO
        CLUB

        ↓

        VER COLECCIÓN
```

Debajo:

```text
Instagram       WhatsApp
```

Footer mínimo.

---

# Animaciones generales

## Hero

- Fade + translate del texto.
- Scale suave de la imagen.
- Parallax muy sutil.
- Hover del CTA.

## Cards

- Fade + translate al entrar en viewport.
- Stagger entre productos.
- Zoom de imagen al hover.
- Aparición de "VER PRODUCTO →".

## Scroll

- Elementos entrando desde abajo.
- Títulos con fade + translate.
- Marquee horizontal.
- Parallax limitado a elementos visuales.

## Producto

- Transición entre imágenes.
- Cambio de variante/color.
- Microinteracciones en thumbnails.
- Hover de botones.

## Carrito

- Animación del contador.
- Feedback al agregar producto.
- Microinteracción del CTA de WhatsApp.

---

# Tecnología sugerida

Para este proyecto no hace falta utilizar Three.js ni WebGL.

Stack recomendado:

```text
React
TypeScript
Tailwind CSS
Motion / Framer Motion
React Router
localStorage
```

La animación debe mantenerse liviana y funcionar bien en mobile.

---

# Principios de implementación

## 1. Performance primero

Evitar:

- videos pesados innecesarios
- WebGL
- Three.js
- efectos complejos que no aporten al producto

Priorizar:

- CSS transforms
- opacity
- scale
- translate
- animaciones GPU-friendly

## 2. Animaciones con propósito

Cada animación debe cumplir al menos una función:

- dirigir la atención
- mostrar interacción
- reforzar la marca
- mejorar la navegación
- presentar mejor un producto

## 3. Consistencia

Usar una misma lógica de animación en todo el sitio.

Por ejemplo:

```text
Entrada:
opacity + translateY

Hover:
scale + opacity

Cambio de contenido:
fade + slide

CTA:
small scale / translate
```

## 4. Mobile-first

Las animaciones deben funcionar también en pantallas pequeñas.

En mobile:

- reducir parallax
- evitar efectos que dependan exclusivamente de hover
- mantener botones y targets táctiles cómodos
- priorizar velocidad y claridad

---

# Sensación buscada

La experiencia completa debería seguir aproximadamente esta secuencia:

```text
1. IMPACTO
   PODIO CLUB
   VESTITE DISTINTO.

        ↓

2. MARCA
   PODIO CLUB / PODIO CLUB / PODIO CLUB

        ↓

3. PRODUCTOS
   NUEVA COLECCIÓN

        ↓

4. IDENTIDAD
   NO ES SOLO UNA REMERA.

        ↓

5. PRODUCTO DESTACADO
   PODIO #01

        ↓

6. CATÁLOGO
   Todas las remeras

        ↓

7. CONVERSIÓN
   COMPRAR POR WHATSAPP

        ↓

8. MARCA
   PODIO CLUB
```

---

# Referencias conceptuales

## OUTFIT

Utilizar como referencia para:

- estructura editorial
- tipografía protagonista
- composición
- presentación de productos
- uso del espacio
- transiciones de scroll

## MOB LINKS

Utilizar como referencia para:

- movimiento
- identidad visual
- sensación de marca
- marquee
- interacción
- transiciones

## Rainishop

Utilizar como referencia para:

- ecommerce
- presentación de productos
- cards
- navegación
- claridad del catálogo

---

# Dirección final

El objetivo no es construir una demo de animaciones.

El objetivo es construir una **tienda de remeras que se sienta como una marca moderna**.

La animación debe acompañar al diseño:

> **La ropa es el protagonista. La animación hace que se vea mejor.**
