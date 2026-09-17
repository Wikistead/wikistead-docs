#!/usr/bin/env node
// ADR-307 (wikistead repo): pins the Apple OVERLAP_SIMPLE/OVERLAP_COMPOUND glyf flags onto
// docs-site's own vendored Inter (#1312 Phase (1)), Noto Sans JP, and Plus Jakarta Sans (#1335)
// faces, and the wiring that serves them.
//
// docs-site has no test runner (no vitest/jest, no *.test.* file anywhere in this repo) — every
// existing correctness check here is a plain Node script chained into package.json's "build"
// script and run by .github/workflows/ci.yml's existing `pnpm build` step. This follows the same
// shape: a WOFF2/Brotli/glyf-transform reader, self-contained (node:zlib's brotliDecompressSync,
// no third-party WOFF2 library), independently re-implemented here since docs-site cannot import
// code across the wikistead repo boundary.
//
// Four things are asserted per family, all required for the fix to actually reach a Mac:
//   1. every non-empty simple glyph in each vendored file carries OVERLAP_SIMPLE, and every
//      composite glyph's first component carries OVERLAP_COMPOUND (the flag bits);
//   2. the set of vendored files matches exactly what the corresponding
//      node_modules/@fontsource/<family>/<weight>.css files discover — not a hardcoded count, since
//      these come from upstream @fontsource and could change on a version bump;
//   3. astro.config.mjs's customCss list contains no `@fontsource/<family>/*` entry (the wiring —
//      the vendored files are actually served, not merely sitting unused in public/fonts/<family>/);
//   4. <family>.css's unicode-range values are byte-identical to the corresponding upstream
//      @fontsource CSS values (the ranges served did not silently drift from what @fontsource
//      itself defines).
//
// Break-check: one deliberately-unpatched fixture per family under scripts/testdata/ (the as-shipped
// @fontsource file, copied before patching) — the reader must report 0 flagged glyphs against it,
// proving it can still go red, not just pass forever once the real files are patched.
//
// "0 scanned is red": an empty or misread file must not silently report "0 problems found" — every
// per-file scan asserts it actually found simple/composite glyphs before trusting its flag count.
import { readFileSync, readdirSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ASTRO_CONFIG = join(root, 'astro.config.mjs')

// One entry per vendored family. `weights` is the exact set of weight CSS files astro.config.mjs
// imports today for that family — used only to know which node_modules/@fontsource/<pkg>/<weight>.css
// files to parse; the per-weight SLICE set itself is never hardcoded, it is discovered from each of
// those CSS files.
const FAMILIES = [
  {
    pkg: 'inter',
    weights: [400, 500, 600, 700],
    fontDir: join(root, 'public/fonts/inter'),
    localCss: join(root, 'src/styles/inter.css'),
    fixture: join(root, 'scripts/testdata/inter-latin-400-normal.unpatched.woff2'),
    fontsourceDir: join(root, 'node_modules/@fontsource/inter'),
    // Inter is deliberately vendored for only these two ranges (ADR-307 rev4/rev5): no tracked
    // docs-site file contains a codepoint in any of the other five ranges @fontsource/inter/NNN.css
    // also serves, and --wks-font's fallback chain covers any that did appear. `null` (the other two
    // families below) means "every slice the upstream CSS defines".
    sliceFilter: new Set(['latin', 'latin-ext']),
  },
  {
    pkg: 'noto-sans-jp',
    weights: [400, 500, 700],
    fontDir: join(root, 'public/fonts/noto-sans-jp'),
    localCss: join(root, 'src/styles/noto-sans-jp.css'),
    fixture: join(root, 'scripts/testdata/noto-sans-jp-latin-400-normal.unpatched.woff2'),
    fontsourceDir: join(root, 'node_modules/@fontsource/noto-sans-jp'),
    sliceFilter: null,
  },
  {
    pkg: 'plus-jakarta-sans',
    weights: [600],
    fontDir: join(root, 'public/fonts/plus-jakarta-sans'),
    localCss: join(root, 'src/styles/plus-jakarta-sans.css'),
    fixture: join(root, 'scripts/testdata/plus-jakarta-sans-latin-600-normal.unpatched.woff2'),
    fontsourceDir: join(root, 'node_modules/@fontsource/plus-jakarta-sans'),
    sliceFilter: null,
  },
]

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

// ---- discovery: parse an upstream @fontsource <weight>.css into {filename -> {weight, range}} ----
//
// Mirrors docs-site/scripts/patch-font-overlap-flags-cjk.py's discover_slices(): the comment names a
// slice (`/* pkg-latin-400-normal */` or, for Noto Sans JP's numbered slices, `/* pkg-[7]-400-normal */`
// with NO brackets in the filename, e.g. `pkg-7-400-normal.woff2`), and the block's own `src` filename
// is checked against that SAME comment's slice — never accepted on trust — so a declaration whose src
// silently points at the wrong slice/weight cannot pass unnoticed (the exact defect apps/web's sibling
// script's discover_slices() docstring documents finding in an earlier version of this file).
function discoverUpstreamSlices(pkg, fontsourceDir, weights, sliceFilter) {
  const pkgEsc = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const discovered = new Map() // filename -> { weight, range }
  const problems = []
  for (const weight of weights) {
    const cssPath = join(fontsourceDir, `${weight}.css`)
    const css = readFileSync(cssPath, 'utf8')
    const blockRe = new RegExp(
      `/\\*\\s*${pkgEsc}-(?:\\[(\\d+)\\]|([a-z]+(?:-[a-z]+)*))-(\\d+)-normal\\s*\\*/([\\s\\S]*?)\\n\\}`,
      'g',
    )
    let matchedCount = 0
    let keptCount = 0
    for (const m of css.matchAll(blockRe)) {
      matchedCount++
      const [, rawNum, rawName, blockWeight, blockBody] = m
      if (blockWeight !== String(weight)) {
        problems.push(`${cssPath}: block's own comment names weight ${blockWeight}, expected ${weight}`)
        continue
      }
      const slice = rawNum !== undefined ? rawNum : rawName
      if (sliceFilter && !sliceFilter.has(slice)) continue // deliberately not vendored (e.g. Inter's non-latin ranges)
      keptCount++
      const srcMatch = blockBody.match(/url\(\.\/files\/([^)]+\.woff2)\)/)
      const rangeMatch = blockBody.match(/unicode-range:\s*([^;]+);/)
      if (!srcMatch || !rangeMatch) {
        problems.push(`${cssPath}: block for slice '${slice}' weight ${weight} is missing a src/unicode-range`)
        continue
      }
      const expectedFilename = `${pkg}-${slice}-${weight}-normal.woff2`
      if (srcMatch[1] !== expectedFilename) {
        problems.push(
          `${cssPath}: slice '${slice}' weight ${weight}'s own comment names this block, but its ` +
            `src points at '${srcMatch[1]}' instead of the expected '${expectedFilename}' — a ` +
            `declaration silently pointing at the wrong slice/weight.`,
        )
        continue
      }
      discovered.set(expectedFilename, { weight, range: rangeMatch[1].trim() })
    }
    // Self-consistency: every comment block found by a simpler, independent count must have produced
    // exactly one accepted-or-filtered-out match (minus anything already reported as a problem above).
    const commentCount = (css.match(new RegExp(`/\\*\\s*${pkgEsc}-.+?-${weight}-normal\\s*\\*/`, 'g')) || []).length
    if (matchedCount !== commentCount) {
      problems.push(
        `${cssPath}: block regex matched ${matchedCount} @font-face block(s) but the file has ` +
          `${commentCount} '${pkg}-...-${weight}-normal' comment(s) — discovery is under-counting.`,
      )
    }
    if (sliceFilter && keptCount !== sliceFilter.size) {
      problems.push(
        `${cssPath}: expected to find all ${sliceFilter.size} of [${[...sliceFilter].join(', ')}], found ${keptCount}.`,
      )
    }
  }
  return { discovered, problems }
}

// ---- parse the local, vendored CSS into {filename -> {weight, range}} ----
function parseLocalCss(pkg, localCssPath) {
  const pkgEsc = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const css = readFileSync(localCssPath, 'utf8')
  const re = new RegExp(
    `font-weight:\\s*(\\d+);\\s*\\n\\s*src:\\s*url\\('/fonts/${pkgEsc}/(${pkgEsc}-[^']+\\.woff2)'\\)[^;]*;\\s*\\n\\s*unicode-range:\\s*([^;]+);`,
    'g',
  )
  const local = new Map() // filename -> { weight, range }
  for (const m of css.matchAll(re)) {
    const [, weight, filename, range] = m
    local.set(filename, { weight: Number(weight), range: range.trim() })
  }
  return local
}

// ---- run all checks, one family at a time ----
const problems = []
let totalFilesScanned = 0

for (const family of FAMILIES) {
  const { pkg, weights, fontDir, localCss, fixture, fontsourceDir, sliceFilter } = family

  // ---- discovery: the expected file set, derived from upstream CSS, never hardcoded ----
  const { discovered, problems: discoveryProblems } = discoverUpstreamSlices(pkg, fontsourceDir, weights, sliceFilter)
  problems.push(...discoveryProblems)
  if (discovered.size === 0) {
    problems.push(`${pkg}: discovered 0 expected files from ${fontsourceDir} — cannot validate vendored output.`)
    continue
  }

  // ---- 1. flag-bit assertions across the vendored files, count checked against discovery ----
  const vendoredFiles = readdirSync(fontDir).filter((f) => f.endsWith('.woff2')).sort()
  const vendoredSet = new Set(vendoredFiles)
  const discoveredSet = new Set(discovered.keys())
  if (vendoredFiles.length !== discovered.size) {
    problems.push(
      `${pkg}: expected ${discovered.size} vendored .woff2 file(s) in ${fontDir} (from CSS discovery), ` +
        `found ${vendoredFiles.length}.`,
    )
  }
  for (const f of vendoredSet) {
    if (!discoveredSet.has(f)) problems.push(`${pkg}: ${f} is vendored in ${fontDir} but was not discovered from upstream CSS (stale/extra file?).`)
  }
  for (const f of discoveredSet) {
    if (!vendoredSet.has(f)) problems.push(`${pkg}: ${f} was discovered from upstream CSS but is missing from ${fontDir}.`)
  }

  for (const file of vendoredFiles) {
    const bytes = readFileSync(join(fontDir, file))
    const { simpleTotal, simpleFlagged, compositeTotal, compositeFlagged } = readOverlapFlags(bytes)
    totalFilesScanned++
    if (simpleTotal === 0 && compositeTotal === 0) {
      problems.push(`${pkg}/${file}: scanned 0 simple and 0 composite glyphs — refusing to trust a "0 problems" read of an empty/misread file.`)
      continue
    }
    if (simpleFlagged !== simpleTotal) {
      problems.push(`${pkg}/${file}: ${simpleTotal - simpleFlagged}/${simpleTotal} simple glyph(s) missing OVERLAP_SIMPLE.`)
    }
    if (compositeFlagged !== compositeTotal) {
      problems.push(`${pkg}/${file}: ${compositeTotal - compositeFlagged}/${compositeTotal} composite glyph(s) missing OVERLAP_COMPOUND on their first component.`)
    }
  }
  console.log(`${pkg}: scanned ${vendoredFiles.length} vendored file(s) (expected ${discovered.size} from CSS discovery).`)

  // ---- break-check: the fixture must read as UNFLAGGED, proving the reader can still go red ----
  const fixtureBytes = readFileSync(fixture)
  const fixtureResult = readOverlapFlags(fixtureBytes)
  if (fixtureResult.simpleTotal === 0) {
    problems.push(`${pkg}: break-check fixture scanned 0 simple glyphs — the fixture itself is empty/misread.`)
  } else if (fixtureResult.simpleFlagged !== 0) {
    problems.push(`${pkg}: break-check fixture expected 0 flagged simple glyphs (it is the deliberately-unpatched original), got ${fixtureResult.simpleFlagged}/${fixtureResult.simpleTotal} — the reader cannot distinguish patched from unpatched.`)
  } else {
    console.log(`${pkg}: break-check OK — fixture reads 0/${fixtureResult.simpleTotal} flagged, as expected for an unpatched file.`)
  }

  // ---- 2. wiring: astro.config.mjs must no longer import @fontsource/<pkg>/*.css ----
  const astroConfig = readFileSync(ASTRO_CONFIG, 'utf8')
  const pkgEsc = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const staleImport = astroConfig.match(new RegExp(`['"]@fontsource/${pkgEsc}/[^'"]+\\.css['"]`))
  if (staleImport) {
    problems.push(`${pkg}: astro.config.mjs still imports ${staleImport[0]} — must be served only from the local, patched ${localCss.replace(root + '/', '')}.`)
  } else {
    console.log(`${pkg}: astro.config.mjs OK — no @fontsource/${pkg}/*.css import remains.`)
  }

  // ---- 3. unicode-range parity: local CSS's ranges must match @fontsource's exactly ----
  //
  // Compared by (filename) — which already keys uniquely by (weight, slice) — not a flat set of
  // range strings: many slices across different weights share the exact same range string (e.g.
  // Inter's every `latin` declaration), so a flat `.includes()`/set-membership check lets one
  // declaration drift (bad edit, or src pointed at the wrong slice) hide behind sibling declarations
  // that still carry a correct value for that range shape. Keying by filename ties each local
  // declaration back to the ONE upstream block it claims to serve.
  const local = parseLocalCss(pkg, localCss)
  if (local.size !== discovered.size) {
    problems.push(`${pkg}: ${localCss.replace(root + '/', '')}: expected ${discovered.size} parseable (weight, filename, unicode-range) declaration(s), found ${local.size}.`)
  }
  let rangeMismatches = 0
  for (const [filename, { range: upstreamRange, weight: upstreamWeight }] of discovered) {
    const localEntry = local.get(filename)
    if (!localEntry) {
      problems.push(`${pkg}: ${localCss.replace(root + '/', '')}: no declaration serving ${filename} (expected to match upstream's unicode-range value).`)
      rangeMismatches++
      continue
    }
    if (localEntry.weight !== upstreamWeight) {
      problems.push(`${pkg}: ${localCss.replace(root + '/', '')}: ${filename}'s declaration has font-weight ${localEntry.weight}, expected ${upstreamWeight}.`)
      rangeMismatches++
    }
    if (localEntry.range !== upstreamRange) {
      problems.push(`${pkg}: ${localCss.replace(root + '/', '')}: ${filename}'s unicode-range does not match upstream (local: ${localEntry.range}; upstream: ${upstreamRange}).`)
      rangeMismatches++
    }
  }
  if (rangeMismatches === 0) {
    console.log(`${pkg}: unicode-range parity OK — every kept declaration matches @fontsource byte-for-byte.`)
  }
}

if (problems.length) {
  console.error('check-font-overlap-flags: FAILED:')
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
console.log(`check-font-overlap-flags OK — ${totalFilesScanned} vendored file(s) across ${FAMILIES.length} families fully flagged, wiring and unicode-range parity confirmed, break-check fixtures still read unflagged.`)
