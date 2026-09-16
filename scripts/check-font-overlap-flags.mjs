#!/usr/bin/env node
// ADR-307 (wikistead repo) Phase (1): pins the Apple OVERLAP_SIMPLE/OVERLAP_COMPOUND glyf flags
// onto docs-site's own vendored Inter faces, and the wiring that serves them.
//
// docs-site has no test runner (no vitest/jest, no *.test.* file anywhere in this repo) — every
// existing correctness check here is a plain Node script chained into package.json's "build"
// script and run by .github/workflows/ci.yml's existing `pnpm build` step. This follows the same
// shape: a WOFF2/Brotli/glyf-transform reader, self-contained (node:zlib's brotliDecompressSync,
// no third-party WOFF2 library), independently re-implemented here since docs-site cannot import
// code across the wikistead repo boundary.
//
// Three things are asserted, all required for the fix to actually reach a Mac:
//   1. every non-empty simple glyph in each of the 8 vendored files carries OVERLAP_SIMPLE, and
//      every composite glyph's first component carries OVERLAP_COMPOUND (the flag bits);
//   2. astro.config.mjs's customCss list contains no `@fontsource/inter/*` entry (the wiring —
//      the vendored files are actually served, not merely sitting unused in public/fonts/inter/);
//   3. inter.css's unicode-range values are byte-identical to the corresponding
//      node_modules/@fontsource/inter/{400,500,600,700}.css values (the ranges served did not
//      silently drift from what @fontsource itself defines).
//
// Break-check: scripts/testdata/inter-latin-400-normal.unpatched.woff2 is a deliberately-unpatched
// fixture (the as-shipped @fontsource file, copied before patching) — the reader must report 0
// flagged glyphs against it, proving it can still go red, not just pass forever once the real
// files are patched.
//
// "0 scanned is red": an empty or misread file must not silently report "0 problems found" — every
// per-file scan asserts it actually found simple/composite glyphs before trusting its flag count.
import { readFileSync, readdirSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const FONT_DIR = join(root, 'public/fonts/inter')
const FIXTURE = join(root, 'scripts/testdata/inter-latin-400-normal.unpatched.woff2')
const ASTRO_CONFIG = join(root, 'astro.config.mjs')
const INTER_CSS = join(root, 'src/styles/inter.css')
const FONTSOURCE_DIR = join(root, 'node_modules/@fontsource/inter')

const OVERLAP_SIMPLE = 0x40 // glyf simple-glyph flag byte, bit 6
const OVERLAP_COMPOUND = 0x0400 // glyf composite-glyph component flags, bit 10
const WOFF2_OVERLAP_SIMPLE_BITMAP_FLAG = 0x0001 // transformed-glyf table header optionFlags bit 0

// ---- UIntBase128 (WOFF2 spec §5.1) ----
function readUIntBase128(buf, pos) {
  let value = 0
  let i = 0
  for (; i < 5; i++) {
    const b = buf[pos + i]
    if (i === 0 && b === 0x80) throw new Error('UIntBase128: leading byte is 0x80 (not shortest form)')
    if (value & 0xfe000000) throw new Error('UIntBase128: overflow')
    value = (value << 7) | (b & 0x7f)
    if ((b & 0x80) === 0) { i++; break }
  }
  return { value: value >>> 0, next: pos + i }
}

/**
 * Parse a WOFF2 file down to its decompressed, transformed `glyf` table, then read the per-glyph
 * OVERLAP_SIMPLE/OVERLAP_COMPOUND state.
 *
 * Returns { simpleTotal, simpleFlagged, compositeTotal, compositeFlagged }.
 */
function readOverlapFlags(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  // WOFF2 header: 48 bytes. numTables at offset 12 (u16).
  const numTables = view.getUint16(12)
  let pos = 48

  // Known-tag table (WOFF2 spec §6.2.1) — index -> 4-byte tag. glyf is index 10.
  const KNOWN_TAGS = [
    'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm',
    'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern',
    'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC',
    'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar',
    'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty',
    'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat',
    'Gloc', 'Feat', 'Sill',
  ]

  let glyfEntry = null
  for (let t = 0; t < numTables; t++) {
    const flagByte = bytes[pos]
    pos += 1
    const tagIndex = flagByte & 0x3f
    const transformVersion = (flagByte >> 6) & 0x3
    let tag
    if (tagIndex === 0x3f) {
      tag = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3])
      pos += 4
    } else {
      tag = KNOWN_TAGS[tagIndex]
    }
    const orig = readUIntBase128(bytes, pos)
    pos = orig.next
    const origLength = orig.value
    // transform present (glyf/loca: transformVersion === 0 means "transformed" per spec table)
    const hasTransform = tag === 'glyf' || tag === 'loca' ? transformVersion === 0 : transformVersion !== 0
    let transformLength = origLength
    if (hasTransform) {
      const tl = readUIntBase128(bytes, pos)
      pos = tl.next
      transformLength = tl.value
    }
    if (tag === 'glyf') {
      glyfEntry = { transformVersion, hasTransform, transformLength }
    }
  }
  if (!glyfEntry) throw new Error('no glyf table entry found in WOFF2 directory')
  if (!glyfEntry.hasTransform) {
    throw new Error(
      `glyf table is untransformed (transformVersion=${glyfEntry.transformVersion}) — this reader ` +
        'only handles the transformed-glyf case; refusing to silently report 0 problems for a shape it cannot parse.',
    )
  }

  // Single Brotli-compressed data block follows the table directory, holding every table's bytes
  // concatenated in directory order. We only need the glyf table's own span within it, but since
  // determining every preceding table's compressed offset requires summing all of their (already
  // computed) transform/orig lengths in order, re-walk is avoided by decompressing once, in full,
  // and computing glyf's byte offset from the running total of prior tables' lengths.
  // (Re-parse the directory a second time to accumulate offsets, since the first pass above did not
  // track them — kept as two small passes for clarity over one large stateful one.)
  let pos2 = 48
  let glyfOffset = -1
  let glyfLength = -1
  let runningOffset = 0
  for (let t = 0; t < numTables; t++) {
    const flagByte = bytes[pos2]
    pos2 += 1
    const tagIndex = flagByte & 0x3f
    const transformVersion = (flagByte >> 6) & 0x3
    let tag
    if (tagIndex === 0x3f) {
      tag = String.fromCharCode(bytes[pos2], bytes[pos2 + 1], bytes[pos2 + 2], bytes[pos2 + 3])
      pos2 += 4
    } else {
      tag = KNOWN_TAGS[tagIndex]
    }
    const orig = readUIntBase128(bytes, pos2)
    pos2 = orig.next
    const origLength = orig.value
    const hasTransform = tag === 'glyf' || tag === 'loca' ? transformVersion === 0 : transformVersion !== 0
    let length = origLength
    if (hasTransform) {
      const tl = readUIntBase128(bytes, pos2)
      pos2 = tl.next
      length = tl.value
    }
    if (tag === 'glyf') {
      glyfOffset = runningOffset
      glyfLength = length
    }
    runningOffset += length
  }

  // Locate the compressed data block: it starts right after the table directory ends (pos2), per
  // WOFF2 layout (no collection header in this project's single-font files).
  const compressed = bytes.subarray(pos2)
  const decompressed = brotliDecompressSync(compressed)
  const glyfBuf = decompressed.subarray(glyfOffset, glyfOffset + glyfLength)

  // Transformed glyf table header (WOFF2 spec §5.1): 36 bytes.
  const gv = new DataView(glyfBuf.buffer, glyfBuf.byteOffset, glyfBuf.byteLength)
  const optionFlags = gv.getUint16(2)
  const numGlyphs = gv.getUint16(4)
  const nContourStreamSize = gv.getUint32(8)
  const nPointsStreamSize = gv.getUint32(12)
  const flagStreamSize = gv.getUint32(16)
  const glyphStreamSize = gv.getUint32(20)
  const compositeStreamSize = gv.getUint32(24)
  const bboxStreamSize = gv.getUint32(28)
  const instructionStreamSize = gv.getUint32(32)

  let off = 36
  const nContourStream = glyfBuf.subarray(off, off + nContourStreamSize); off += nContourStreamSize
  off += nPointsStreamSize // not needed for overlap-flag reading
  off += flagStreamSize
  off += glyphStreamSize
  const compositeStream = glyfBuf.subarray(off, off + compositeStreamSize); off += compositeStreamSize
  off += bboxStreamSize
  off += instructionStreamSize

  const hasOverlapBitmap = (optionFlags & WOFF2_OVERLAP_SIMPLE_BITMAP_FLAG) !== 0
  let overlapBitmap = null
  if (hasOverlapBitmap) {
    const bitmapBytes = (numGlyphs + 7) >> 3
    overlapBitmap = glyfBuf.subarray(off, off + bitmapBytes)
  }

  let simpleTotal = 0
  let simpleFlagged = 0
  let compositeTotal = 0
  let compositeFlagged = 0
  let compositeCursor = 0

  const ncView = new DataView(nContourStream.buffer, nContourStream.byteOffset, nContourStream.byteLength)
  for (let i = 0; i < numGlyphs; i++) {
    const nContours = ncView.getInt16(i * 2)
    if (nContours === -1) {
      // Composite: walk one composite glyph's components from compositeStream, per the glyf
      // composite-glyph record format (flags:u16, glyphIndex:u16, then argument/scale fields sized
      // by the flags — WE_HAVE_A_SCALE=0x0008, WE_HAVE_AN_X_AND_Y_SCALE=0x0040/MORE_COMPONENTS=0x0020
      // /WE_HAVE_A_TWO_BY_TWO=0x0080/ARGS_ARE_WORDS=0x0001). We only need the FIRST component's
      // flags field of each composite glyph (OVERLAP_COMPOUND lives there), then must still skip
      // past the rest of that glyph's components to keep compositeCursor aligned for the next
      // composite glyph.
      compositeTotal++
      let firstFlags = null
      let more = true
      while (more) {
        // Big-endian (all sfnt/WOFF2 numeric fields are network byte order) -- NOT little-endian.
        const flags = (compositeStream[compositeCursor] << 8) | compositeStream[compositeCursor + 1]
        if (firstFlags === null) firstFlags = flags
        compositeCursor += 2 // flags
        compositeCursor += 2 // glyphIndex
        const argsAreWords = (flags & 0x0001) !== 0
        compositeCursor += argsAreWords ? 4 : 2 // argument1/argument2
        if (flags & 0x0008) compositeCursor += 2 // WE_HAVE_A_SCALE
        else if (flags & 0x0040) compositeCursor += 4 // WE_HAVE_AN_X_AND_Y_SCALE
        else if (flags & 0x0080) compositeCursor += 8 // WE_HAVE_A_TWO_BY_TWO
        more = (flags & 0x0020) !== 0 // MORE_COMPONENTS
      }
      if (firstFlags !== null && (firstFlags & OVERLAP_COMPOUND) !== 0) compositeFlagged++
    } else if (nContours > 0) {
      simpleTotal++
      if (hasOverlapBitmap && (overlapBitmap[i >> 3] & (0x80 >> (i & 7))) !== 0) simpleFlagged++
    }
    // nContours === 0 (empty glyph): not counted either way.
  }

  return { simpleTotal, simpleFlagged, compositeTotal, compositeFlagged }
}

// ---- 1. flag-bit assertions across the 8 vendored files ----
const files = readdirSync(FONT_DIR).filter((f) => f.endsWith('.woff2')).sort()
if (files.length !== 8) {
  console.error(`check-font-overlap-flags: expected 8 vendored .woff2 files in ${FONT_DIR}, found ${files.length}.`)
  process.exit(1)
}

const problems = []
for (const file of files) {
  const bytes = readFileSync(join(FONT_DIR, file))
  const { simpleTotal, simpleFlagged, compositeTotal, compositeFlagged } = readOverlapFlags(bytes)
  if (simpleTotal === 0 && compositeTotal === 0) {
    problems.push(`${file}: scanned 0 simple and 0 composite glyphs — refusing to trust a "0 problems" read of an empty/misread file.`)
    continue
  }
  console.log(`${file}: scanned ${simpleTotal} simple glyph(s), ${simpleFlagged} flagged; ${compositeTotal} composite glyph(s), ${compositeFlagged} flagged.`)
  if (simpleFlagged !== simpleTotal) {
    problems.push(`${file}: ${simpleTotal - simpleFlagged}/${simpleTotal} simple glyph(s) missing OVERLAP_SIMPLE.`)
  }
  if (compositeFlagged !== compositeTotal) {
    problems.push(`${file}: ${compositeTotal - compositeFlagged}/${compositeTotal} composite glyph(s) missing OVERLAP_COMPOUND on their first component.`)
  }
}

// ---- break-check: the fixture must read as UNFLAGGED, proving the reader can still go red ----
const fixtureBytes = readFileSync(FIXTURE)
const fixtureResult = readOverlapFlags(fixtureBytes)
if (fixtureResult.simpleTotal === 0) {
  problems.push('break-check fixture: scanned 0 simple glyphs — the fixture itself is empty/misread.')
} else if (fixtureResult.simpleFlagged !== 0) {
  problems.push(`break-check fixture: expected 0 flagged simple glyphs (it is the deliberately-unpatched original), got ${fixtureResult.simpleFlagged}/${fixtureResult.simpleTotal} — the reader cannot distinguish patched from unpatched.`)
} else {
  console.log(`break-check OK — fixture reads 0/${fixtureResult.simpleTotal} flagged, as expected for an unpatched file.`)
}

// ---- 2. wiring: astro.config.mjs must no longer import @fontsource/inter/*.css ----
const astroConfig = readFileSync(ASTRO_CONFIG, 'utf8')
const staleImport = astroConfig.match(/['"]@fontsource\/inter\/[^'"]+\.css['"]/)
if (staleImport) {
  problems.push(`astro.config.mjs still imports ${staleImport[0]} — Inter must be served only from the local, patched ./src/styles/inter.css.`)
} else {
  console.log('astro.config.mjs OK — no @fontsource/inter/*.css import remains.')
}

// ---- 3. unicode-range parity: inter.css's ranges must match @fontsource's exactly ----
//
// Parsed per (weight, slice) tuple, not as a flat set of range strings: membership in the set of
// 8 kept ranges is not enough, because latin/latin-ext each repeat the SAME range string across
// all 4 weights (e.g. every latin declaration shares "U+0000-00FF,..."). A flat `.includes()`
// check lets one declaration drift (a bad edit, or a src pointed at the wrong slice) hide behind
// the 3 other declarations that still carry the correct value for that range shape — it never
// checks that THIS weight's THIS slice matches THIS weight's THIS slice upstream. Comparing by
// tuple catches both: an edited range value (no local tuple matches its own upstream counterpart
// any more) and a range/src mismatch (the local tuple's src file doesn't name the slice its range
// value belongs to).
const interCss = readFileSync(INTER_CSS, 'utf8')
const localDecls = [...interCss.matchAll(
  /font-weight:\s*(\d+);\s*\n\s*src:\s*url\('\/fonts\/inter\/inter-(latin(?:-ext)?)-\d+-normal\.woff2'\)[^;]*;\s*\n\s*unicode-range:\s*([^;]+);/g,
)].map((m) => ({ weight: Number(m[1]), slice: m[2], range: m[3].trim() }))
if (localDecls.length !== 8) {
  problems.push(`src/styles/inter.css: expected 8 parseable (weight, slice, unicode-range) declarations (4 weights x latin/latin-ext), found ${localDecls.length}.`)
}

for (const weight of [400, 500, 600, 700]) {
  const css = readFileSync(join(FONTSOURCE_DIR, `${weight}.css`), 'utf8')
  for (const slice of ['latin', 'latin-ext']) {
    const blockRe = new RegExp(`/\\* inter-${slice}-${weight}-normal \\*/[\\s\\S]*?unicode-range:\\s*([^;]+);`)
    const m = css.match(blockRe)
    if (!m) {
      problems.push(`node_modules/@fontsource/inter/${weight}.css: could not find the ${slice} block to compare against.`)
      continue
    }
    const upstream = m[1].trim()
    const local = localDecls.find((d) => d.weight === weight && d.slice === slice)
    if (!local) {
      problems.push(`src/styles/inter.css: no font-weight:${weight} declaration serving inter-${slice}-${weight}-normal.woff2 (expected to match @fontsource/inter/${weight}.css's ${slice} value).`)
    } else if (local.range !== upstream) {
      problems.push(`src/styles/inter.css: font-weight:${weight} ${slice} declaration's unicode-range does not match @fontsource/inter/${weight}.css's ${slice} value (local: ${local.range}; upstream: ${upstream}).`)
    }
  }
}
if (problems.length === 0 || !problems.some((p) => p.includes('unicode-range') || p.includes('declaration'))) {
  console.log('unicode-range parity OK — every kept (weight, slice) declaration matches @fontsource/inter byte-for-byte.')
}

if (problems.length) {
  console.error('check-font-overlap-flags: FAILED:')
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
console.log(`check-font-overlap-flags OK — ${files.length} vendored file(s) fully flagged, wiring and unicode-range parity confirmed, break-check fixture still reads unflagged.`)
