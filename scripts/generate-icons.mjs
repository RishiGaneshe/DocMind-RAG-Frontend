// Rasterises the DocMind logo mark into the PNG sizes that browsers cannot take
// as SVG: apple-touch-icon.png (iOS home screen) and icon-512.png (manifest).
//
//   node scripts/generate-icons.mjs
//
// Deliberately dependency-free — the mark is nothing but rounded rectangles, so
// a 4x-supersampled software rasteriser plus zlib is enough, and the build stays
// free of a native image toolchain.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const SS = 4 // supersampling factor per axis

/** Rounded-rect coverage test in a normalised 32x32 design space. */
const roundedRect = (x, y, w, h, r) => (px, py) => {
  const cx = Math.min(Math.max(px, x + r), x + w - r)
  const cy = Math.min(Math.max(py, y + r), y + h - r)
  if (px < x || px > x + w || py < y || py > y + h) return false
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy <= r * r
}

// #0A0D0F plate + the three Icy Blue bars, identical geometry to favicon.svg.
const LAYERS = [
  { hit: roundedRect(0, 0, 32, 32, 7), rgb: [0x0a, 0x0d, 0x0f], a: 1 },
  { hit: roundedRect(7, 8, 18, 3.5, 1.75), rgb: [0xa4, 0xd8, 0xff], a: 1 },
  { hit: roundedRect(7, 14.25, 13, 3.5, 1.75), rgb: [0xa4, 0xd8, 0xff], a: 0.72 },
  { hit: roundedRect(7, 20.5, 8, 3.5, 1.75), rgb: [0xa4, 0xd8, 0xff], a: 0.42 },
]

function renderRGBA(size) {
  const px = Buffer.alloc(size * size * 4)
  const step = 32 / size
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Accumulate premultiplied colour over the SS x SS sample grid.
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const dx = (x + (sx + 0.5) / SS) * step
          const dy = (y + (sy + 0.5) / SS) * step
          let sr = 0
          let sg = 0
          let sb = 0
          let sa = 0
          for (const layer of LAYERS) {
            if (!layer.hit(dx, dy)) continue
            const la = layer.a
            sr = layer.rgb[0] * la + sr * (1 - la)
            sg = layer.rgb[1] * la + sg * (1 - la)
            sb = layer.rgb[2] * la + sb * (1 - la)
            sa = la + sa * (1 - la)
          }
          r += sr
          g += sg
          b += sb
          a += sa
        }
      }
      const n = SS * SS
      const alpha = a / n
      const i = (y * size + x) * 4
      // Un-premultiply back to straight alpha for PNG storage.
      px[i] = alpha > 0 ? Math.round(r / n / alpha) : 0
      px[i + 1] = alpha > 0 ? Math.round(g / n / alpha) : 0
      px[i + 2] = alpha > 0 ? Math.round(b / n / alpha) : 0
      px[i + 3] = Math.round(alpha * 255)
    }
  }
  return px
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const byte of buf) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: truecolour + alpha
  // Prefix every scanline with filter type 0 (None).
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const [name, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-512.png', 512],
]) {
  const file = join(OUT, name)
  writeFileSync(file, png(size, renderRGBA(size)))
  console.log(`wrote ${name} (${size}x${size})`)
}

//
//