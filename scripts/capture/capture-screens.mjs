#!/usr/bin/env node
// The ONLY licit source of raster images on this docs site (#708 / #706 §5).
//
// WHY THESE IMAGES EXIST: an editor page that shows only notation asks the reader to imagine the
// result. Each capture below is the second half of a "notation → this is what you get" pair, placed
// beside the code fence it belongs to.
//
// THE RULES, all inherited from decisions this project already paid for:
//   - REAL APP ONLY (#708). Every image is the running product rendering content that was really
//     typed into it through the editor. Nothing is composited, mocked or drawn on.
//   - CROPPED TO THE SUBJECT (#696/#709's acceptance: legible at display width). A shrunk browser
//     window is what got the first LP hero bounced; these clip to the element's own box plus a
//     margin, so a callout is a callout at 100%, not a screenshot of an app that contains one.
//   - NO sharp (ADR-011 / the astro config's note): the site uses passthroughImageService, so what
//     lands here is the final PNG.
//   - IDEMPOTENT AND SELF-CLEANING: a throwaway space per run, deleted afterwards, so a second run
//     does not accumulate debris in the workspace it borrowed.
//   - PROVENANCE PINNED: manifest.json records what produced each file, so an image whose origin
//     nobody can name is visible as such.
//
// The content is STAGED, the product is not: what each page says was chosen to read well in a
// documentation page, exactly as a real workspace's content is chosen by whoever writes it.
//
// Point WKS_BASE at a dev web server wired to a live backend and run:
//   node scripts/capture/capture-screens.mjs
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = process.env.WKS_BASE ?? 'http://dev.localhost:5183'
const API = `${BASE}/api`
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../src/assets/screenshots')
mkdirSync(OUT, { recursive: true })

// ⚠️ `content-type: application/json` is sent ONLY with a body. Fastify rejects a bodyless request
// that CLAIMS to carry JSON (FST_ERR_CTP_EMPTY_JSON_BODY, 400), so a constant header made every
// DELETE in the cleanup fail — silently, in the first version, which is how a capture space survived
// and the next run's tag list photographed its leftovers.
const AUTH = { Authorization: 'Bearer dev-token' }
const api = async (method, path, body) => {
  const headers = body ? { ...AUTH, 'content-type': 'application/json' } : AUTH
  const r = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${await r.text()}`)
  const text = await r.text()
  return text ? JSON.parse(text) : null
}

const manifestPath = join(OUT, 'manifest.json')
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

// A REAL Excalidraw scene: the fence body IS the scene JSON, which is how the product stores a
// drawing. The renderer treats this exactly as it treats one a user drew.
const scene = (() => {
  const el = (o) => ({
    angle: 0, strokeColor: '#1e1e1e', backgroundColor: 'transparent', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100, groupIds: [], frameId: null,
    roundness: { type: 3 }, seed: 11, version: 1, versionNonce: 11, isDeleted: false,
    boundElements: null, updated: 1, link: null, locked: false, ...o,
  })
  const label = (id, x, y, text, w) => el({
    type: 'text', id, x, y, width: w, height: 25, text, fontSize: 16, fontFamily: 1,
    textAlign: 'center', verticalAlign: 'middle', baseline: 18, containerId: null,
    originalText: text, lineHeight: 1.25, roundness: null,
  })
  return JSON.stringify({
    elements: [
      el({ type: 'rectangle', id: 'r1', x: 0, y: 20, width: 150, height: 60, backgroundColor: '#d0ebff' }),
      label('t1', 12, 38, 'Idea', 126),
      el({ type: 'arrow', id: 'a1', x: 160, y: 50, width: 80, height: 0, points: [[0, 0], [80, 0]], lastCommittedPoint: null, startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: 'arrow', roundness: { type: 2 } }),
      el({ type: 'rectangle', id: 'r2', x: 250, y: 20, width: 150, height: 60, backgroundColor: '#d3f9d8' }),
      label('t2', 262, 38, 'Shipped', 126),
    ],
    appState: {}, files: {},
  })
})()

// Each shot: the body to type, and the selectors whose UNION box is the crop. Selector order does
// not matter; the union is taken so a shot can carry two blocks that belong together (a callout
// family, a checklist and its ring) without capturing the whitespace beside them.
const SHOTS = [
  {
    file: 'callouts.png',
    title: 'Callout examples',
    body: [
      ':::note', 'Ordinary aside: worth knowing, not urgent.', ':::', '',
      ':::tip', 'Share the link and everyone can write. No accounts needed.', ':::', '',
      ':::warning', 'Revoking a share link takes effect immediately.', ':::', '',
      ':::danger[Deleting a space]', 'A space delete removes its pages for everyone.', ':::',
    ].join('\n'),
    select: ['[data-testid=callout-panel]'],
    expect: ['Ordinary aside', 'Share the link', 'Revoking a share link', 'Deleting a space'],
  },
  {
    file: 'tables.png',
    title: 'Table example',
    body: [
      '| Surface | Who reaches it | Written through |',
      '| --- | --- | --- |',
      '| REST API | any script with a key | its own endpoints |',
      '| Webhooks | your endpoint | not written, delivered |',
      '| MCP | a connected assistant | the editing path a person uses |',
    ].join('\n'),
    select: ['.cm-lp-table-wrap'],
    expect: ['REST API', 'Webhooks', 'MCP'],
  },
  {
    file: 'diagrams.png',
    title: 'Diagram example',
    body: ['```mermaid', 'graph LR', '  Draft --> Review --> Published', '  Review --> Draft', '```'].join('\n'),
    select: ['[data-testid=macro-mermaid]'],
    expect: ['Draft', 'Review', 'Published'],
  },
  {
    file: 'drawings.png',
    title: 'Drawing example',
    body: ['```excalidraw', scene, '```'].join('\n'),
    select: ['[data-testid=macro-excalidraw]', '.cm-lp-excalidraw'],
    // A drawing is a canvas, so there is no text to assert; the size floor below is its guard.
    minHeight: 120,
  },
  // #708: ONE image carrying columns, tabs and details sat in the Columns section alone,
  // while the page documents the three under separate headings. A figure belongs beside the notation
  // it illustrates, so this is three shots now — and the required-words declarations split with them.
  {
    file: 'columns.png',
    title: 'Columns example',
    body: [
      ':::columns', ':::column', '**Before**', '', 'One long page nobody scrolls.', ':::',
      ':::column', '**After**', '', 'Two columns the eye can compare.', ':::', ':::',
    ].join('\n'),
    select: ['[data-testid=macro-columns]'],
    expect: ['Before', 'After', 'One long page nobody scrolls.'],
  },
  {
    file: 'tabs.png',
    title: 'Tabs example',
    // ⚠️ Real commands from docs/self-hosting.md (#708): a reader takes what is inside a screenshot
    // as a product fact exactly as readily as the prose around it.
    body: [
      ':::tabs', ':::tab[Docker]', '`docker compose --profile apps up -d`', ':::',
      ':::tab[From source]', '`pnpm install && pnpm dev:up`', ':::', ':::',
    ].join('\n'),
    select: ['[data-testid=macro-tabs]'],
    expect: ['Docker', 'From source', 'docker compose'],
  },
  {
    file: 'details.png',
    title: 'Details example',
    body: [
      ':::details[Why the defaults are what they are]',
      'Collapsed by default so the page stays scannable.', ':::',
    ].join('\n'),
    select: ['[data-testid=macro-details]'],
    expect: ['Why the defaults are what they are'],
    minHeight: 30,
  },
  {
    file: 'tasks.png',
    title: 'Task examples',
    body: [
      '## Launch checklist', '',
      '- [x] write the announcement',
      '- [x] rehearse the demo',
      '- [ ] publish the docs',
      '- [ ] tell the mailing list',
    ].join('\n'),
    select: ['.cm-lp-todo', '.cm-line'],
    expect: ['Launch checklist', 'publish the docs'],
  },
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 }, locale: 'en-US', deviceScaleFactor: 2 })
await ctx.addInitScript(() => localStorage.setItem('wks.lang', 'en'))
// The DEV badge marks the dev-token bypass identity, an artefact of the dev ENVIRONMENT rather than
// of the product (a real session never shows it). Hiding it is the one cosmetic step taken.
await ctx.addInitScript(() => {
  const style = document.createElement('style')
  style.textContent = '[data-testid=dev-mode-badge]{display:none}'
  document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style))
})
const page = await ctx.newPage()

let spaceId = null
let priorKeymap = null
const made = []

async function mkPage(title, parentId = null) {
  const p = await api('POST', `/spaces/${spaceId}/pages`, parentId ? { title, parentId } : { title })
  made.push(p.id)
  return p
}

// Bodies live in the collaborative document (one Y.Text) — there is no content API, and typing
// through the real editor is precisely what these images claim to show. insertText rather than
// keyboard.type so list auto-continuation does not double the bullets.
async function writeBody(id, text) {
  await page.goto(`${BASE}/p/${id}`)
  await page.waitForSelector('[data-pane=preview] .cm-content')
  await page.click('[data-testid=edit-toggle]')
  await page.waitForTimeout(300)
  await page.click('[data-pane=preview] .cm-content')
  await page.keyboard.insertText(text)
  await page.waitForTimeout(1500) // collab flush
  await api('POST', `/pages/${id}/publish`, {}).catch(() => {})
}

// Crop = the union of the matched elements' boxes, padded. Never the viewport: an image of the whole
// window is unreadable at the width a docs page gives it, which is the defect #709 bounced.
// Wait until one of a shot's selectors is on screen, then let it finish laying out. A fixed sleep
// is a guess about someone else's async work; this waits for the thing being photographed.
async function settleOn(selectors, timeout = 20_000) {
  await page.waitForSelector(selectors.join(', '), { timeout }).catch(() => {})
  await page.waitForTimeout(1200)
}

// #708: some blocks are UNRECOGNISABLE on the read surface.
//
// An embedded page renders as the other page's content with nothing around it — by design; the host
// swaps the resolved body into the card and there is no "from: Support hours" line. So a crop of the
// read surface, however careful, shows a heading and a sentence: the reader cannot tell it is an
// embed, and the same is true of a generated `:::children` list next to a hand-typed one.
//
// The fix is the COMPOSITION, not the crop: on the EDIT surface these are atoms, and selecting one
// draws the product's own ring around it (`cm-lp-atom-sel`). The picture then says "this block is one
// object the editor manages" without any staged prose claiming it.
async function shootSelectedAtom(file, bodySelectors, opts = {}) {
  await page.click('[data-testid=edit-toggle]')
  await page.waitForTimeout(400)
  await settleOn(bodySelectors)
  const atom = page.locator(bodySelectors.join(', ')).first()
  await atom.click({ position: { x: 8, y: 8 } }).catch(() => {})
  await page.waitForTimeout(500)
  const ringed = await page.evaluate(() => !!document.querySelector('.cm-lp-atom-sel'))
  if (!ringed) throw new Error(`${file}: clicking the block did not select it — without the ring the picture cannot show that this is one object`)
  await page.mouse.move(4, 4)
  // …and the HOST's own line above it, so the BOUNDARY is in frame: the reader sees where the page
  // stops being its own and starts being somebody else's. The affordance chip the editor floats over
  // a selected atom ("Ctrl+↵ to edit") sits between them and comes along, which is the other half of
  // the answer to "how would I know this is not just text".
  await page.evaluate(() => {
    const atom = document.querySelector('.cm-lp-atom-sel')
    for (let el = atom?.previousElementSibling, n = 0; el && n < 2; el = el.previousElementSibling, n++) {
      if (el.className && String(el.className).includes('cm-line')) { el.classList.add('wks-shot-ctx'); break }
    }
  })
  // Give the top of the composition room: the crop clamps at the viewport edge, and a block near the
  // top came out with the host's line sliced through the middle of its letters.
  await page.evaluate(() => {
    const top = document.querySelector('.wks-shot-ctx') ?? document.querySelector('.cm-lp-atom-sel')
    const r = top?.getBoundingClientRect()
    if (r && r.top < 120) document.querySelector(".cm-scroller")?.scrollBy(0, r.top - 120)
  })
  await page.waitForTimeout(300)
  await shoot(file, ['.cm-lp-atom-sel', '.wks-shot-ctx'], { ...opts, padTop: 34 })
}

const PAD = 16
// ⚠️ "The element exists" is NOT "the element shows the thing". The first run of this script wrote a
// blank 88px page-lists.png and a layout-macros.png reading "Empty Columns" — both had matching
// elements, both passed a presence-only check, and both would have shipped as documentation of a
// broken product. So a shot declares the words it must contain (or, for a canvas, a height floor),
// and a shot that cannot show them fails the run instead of writing the file.
async function shoot(file, selectors, opts = {}) {
  const found = await page.evaluate((sels) => {
    const els = sels.flatMap((s) => [...document.querySelectorAll(s)])
    const boxes = els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 4 && r.height > 4)
    if (boxes.length === 0) return null
    const x = Math.min(...boxes.map((b) => b.left)), y = Math.min(...boxes.map((b) => b.top))
    const r = Math.max(...boxes.map((b) => b.right)), bt = Math.max(...boxes.map((b) => b.bottom))
    return { box: { x, y, width: r - x, height: bt - y }, text: els.map((e) => e.textContent ?? '').join(' ') }
  }, selectors)
  if (!found) throw new Error(`${file}: none of ${selectors.join(', ')} rendered — refusing to write a blank image`)
  const { box, text } = found
  for (const want of opts.expect ?? []) {
    if (!text.includes(want)) throw new Error(`${file}: rendered without "${want}" — the staged content is wrong, or the feature is`)
  }
  // The editor's own empty-state wording. If it is on screen, the capture is documenting a placeholder.
  if (/\bEmpty [A-Z]/.test(text)) throw new Error(`${file}: an empty-state placeholder is in frame — the notation staged for it is wrong`)
  if (box.height < (opts.minHeight ?? 40)) throw new Error(`${file}: only ${Math.round(box.height)}px tall — nothing rendered into it`)
  const vp = page.viewportSize()
  // ⚠️ The top padding is asymmetric on purpose: a floating affordance chip (the editor's
  // "Ctrl+↵ to edit") is positioned ABOVE the block it belongs to and is not part of any box this
  // measures, so a symmetric pad sliced it — and with it the host line above. Measured: 16px cut the
  // chip in half every time.
  const padTop = (opts.padTop ?? PAD)
  const clip = {
    x: Math.max(0, box.x - PAD), y: Math.max(0, box.y - padTop),
    width: Math.min(vp.width - Math.max(0, box.x - PAD), box.width + PAD * 2),
    height: Math.min(vp.height - Math.max(0, box.y - padTop), box.height + padTop + PAD),
  }
  await page.screenshot({ path: join(OUT, file), clip })
  manifest[file] = {
    capture: 'scripts/capture/capture-screens.mjs',
    capturedAt: new Date().toISOString().slice(0, 10),
    source: `the running Wikistead dev app at ${BASE}`,
    crop: selectors.join(' + '),
  }
  console.log(`captured ${file}`)
}

// #709: the HERO is measured, not judged. The rejection twice over was "still too small", and
// the number behind it is the SCALE RATIO — displayed width ÷ the app width the image contains. So the
// app viewport used here is recorded in the manifest, `check-hero-scale.mjs` reads it, and the pin
// fails below 0.85 instead of somebody deciding whether it looks big enough.
// 800, not 1000: the pin measures the TABLET width too, where the frame is 736px. An image carrying
// 1000px of app reads at 0.74 there — under the floor — so the app slice is chosen to fit the
// NARROWEST frame that still shows it (736/800 = 0.92), and the desktop frame then shows it larger
// than life-size, which is the direction that helps.
const HERO_APP_WIDTH = 800
const HERO_DPR = 2
const heroSpaces = []
const heroPages = []
const HERO_BODY = [
  ':::tip',
  'Everyone on this page arrived through one share link. No accounts, no setup.',
  ':::',
  '',
  '## How a page becomes public',
  '',
  '```mermaid',
  'graph LR',
  '  Write --> Share --> Publish',
  '```',
  '',
  '## This week',
  '',
  '- [x] draft the announcement',
  '- [ ] publish the docs',
].join('\n')

try {
  // The dev identity may carry a vim keymap; these images speak the product's DEFAULT surface.
  priorKeymap = (await api('GET', '/me/settings').catch(() => null))?.editorKeymap ?? null
  await api('PATCH', '/me/settings', { editorKeymap: 'default' }).catch(() => {})
  spaceId = (await api('POST', '/spaces', { name: 'Docs captures' })).id

  for (const shot of SHOTS) {
    const p = await mkPage(shot.title)
    await writeBody(p.id, shot.body)
    await page.goto(`${BASE}/p/${p.id}`) // the READ surface: what a reader of the page sees
    await page.waitForSelector('[data-pane=preview] .cm-content')
    // Wait for the SUBJECT, not for a guess at how long it takes: mermaid and Excalidraw resolve
    // asynchronously, and a fixed sleep captured a diagram-less page the first time it ran slow.
    await settleOn(shot.select)
    await page.mouse.move(4, 4) // park the pointer: no hover chrome in a still image
    await shoot(shot.file, shot.select, { expect: shot.expect, minHeight: shot.minHeight })
  }

  // ── page lists: `:::children` is only itself with real children under a real parent ──────────
  const parent = await mkPage('Team handbook')
  // Each child gets a body and a publish: the first run created titles only, the list had nothing
  // publishable to show, and the capture came out as 88px of white.
  for (const t of ['How we write', 'How we review', 'How we release']) {
    const child = await mkPage(t, parent.id)
    await writeBody(child.id, `Our habits for ${t.toLowerCase()}.`)
  }
  await writeBody(parent.id, [
    '# Team handbook',
    '',
    'Everything below is generated from the pages filed under this one.',
    '',
    '## In this handbook',
    '',
    ':::children', ':::',
  ].join('\n'))
  await page.goto(`${BASE}/p/${parent.id}`)
  await page.waitForSelector('[data-pane=preview] .cm-content')
  await settleOn(['.cm-lp-macro-wrap'])
  // A generated child list and a hand-typed list of links look identical on the read surface, which
  // is the same defect as the embed one — so it is shown as the atom it is.
  await shootSelectedAtom('page-lists.png', ['[data-testid=macro-children-slot]', '.cm-lp-macro-wrap'], {
    expect: ['How we write', 'How we review', 'How we release'],
  })

  // ── tags: a `:::tagged` list is only itself when tagged pages exist to list ──────────────────
  for (const t of ['Q3 roadmap', 'Q4 roadmap']) {
    const p = await mkPage(t)
    await writeBody(p.id, ['---', 'tags: [roadmap]', '---', '', `Planning notes for ${t}.`].join('\n'))
  }
  const tagged = await mkPage('Everything tagged roadmap')
  await writeBody(tagged.id, ['## Tagged `roadmap`', '', ':::tagged', 'roadmap', ':::'].join('\n'))
  await page.goto(`${BASE}/p/${tagged.id}`)
  await page.waitForSelector('[data-pane=preview] .cm-content')
  await settleOn(['.cm-lp-macro-wrap'])
  await shoot('tags.png', ['.cm-lp-macro-wrap', '.cm-lp-h2'], { expect: ['Q3 roadmap', 'Q4 roadmap'] })

  // ── embeds: an embedded page must be a page that really exists and is really readable ────────
  const source = await mkPage('Support hours')
  await writeBody(source.id, ['## Support hours', '', 'Weekdays 09:00–17:00 JST. Urgent issues: page the on-call rota.'].join('\n'))
  const host = await mkPage('Customer handbook')
  await writeBody(host.id, [
    '## When to escalate',
    '',
    'Anything a customer cannot work around goes to the on-call rota.',
    '',
    'Escalation starts with the current hours, which the support team keeps up to date:',
    '',
    ':::embed-page', source.id, ':::',
  ].join('\n'))
  await page.goto(`${BASE}/p/${host.id}`)
  await page.waitForSelector('[data-pane=preview] .cm-content')
  await settleOn(['[data-testid=macro-embed-page]', '.cm-lp-embed-page'])
  await shootSelectedAtom('embeds.png', ['[data-testid=macro-embed-page]', '.cm-lp-embed-page'], {
    expect: ['Support hours', 'Weekdays'],
  })

  // ── the hero: its own narrow context, so the app inside the image is close to the size the docs
  //    page will display it at (that ratio IS the acceptance, #709) ──────────────────────────────
  const heroCtx = await browser.newContext({ viewport: { width: HERO_APP_WIDTH, height: 560 }, locale: 'en-US', deviceScaleFactor: HERO_DPR })
  await heroCtx.addInitScript(() => localStorage.setItem('wks.lang', 'en'))
  await heroCtx.addInitScript(() => {
    const style = document.createElement('style')
    style.textContent = '[data-testid=dev-mode-badge]{display:none}'
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style))
  })
  const heroPage = await heroCtx.newPage()
  // Its OWN space. The shots above leave a sidebar full of "Table example" / "Drawing example", which
  // is honest and reads like somebody's test workspace — the hero is the first thing a visitor sees,
  // so its tree is a curated one. Still the real product; what is staged is the content.
  const heroSpaceId = (await api('POST', '/spaces', { name: 'Product launch' })).id
  heroSpaces.push(heroSpaceId)
  const inHero = async (title, parentId = null) => {
    const p = await api('POST', `/spaces/${heroSpaceId}/pages`, parentId ? { title, parentId } : { title })
    heroPages.push(p.id)
    return p
  }
  const hero = await inHero('Plan the launch together')
  await inHero('Announcement draft', hero.id)
  await inHero('Demo script', hero.id)
  await inHero('Team handbook')
  await inHero('Release notes')
  await writeBody(hero.id, HERO_BODY)
  await heroPage.goto(`${BASE}/p/${hero.id}`)
  await heroPage.waitForSelector('[data-pane=preview] .cm-content')
  await heroPage.waitForSelector('[data-testid=macro-mermaid]', { timeout: 20_000 }).catch(() => {})
  await heroPage.waitForTimeout(1500)
  await heroPage.mouse.move(4, 4)
  const heroText = await heroPage.evaluate(() => document.querySelector('[data-pane=preview]')?.textContent ?? '')
  for (const want of ['share link', 'How a page becomes public', 'publish the docs']) {
    if (!heroText.includes(want)) throw new Error(`hero: rendered without "${want}"`)
  }
  await heroPage.screenshot({ path: join(OUT, '../editor-live-preview.png') })
  manifest['editor-live-preview.png'] = {
    capture: 'scripts/capture/capture-screens.mjs',
    capturedAt: new Date().toISOString().slice(0, 10),
    source: `the running Wikistead dev app at ${BASE}`,
    // Read by scripts/check-hero-scale.mjs: naturalWidth ÷ dpr is the APP width inside the image, and
    // the pin divides the displayed width by it. Recording this is what keeps the pin from guessing.
    appCssWidth: HERO_APP_WIDTH,
    dpr: HERO_DPR,
  }
  console.log('captured editor-live-preview.png (hero)')
  await heroCtx.close()
} finally {
  if (priorKeymap) await api('PATCH', '/me/settings', { editorKeymap: priorKeymap }).catch(() => {})
  // ⚠️ CLEANUP FAILURES ARE REPORTED, not swallowed. The first version silenced them, a run's space
  // survived, and the NEXT run's `:::tagged` capture listed four pages where the staging had two —
  // debris photographed as a product behaviour. A page delete that 404s is fine (its parent took the
  // subtree); the SPACE delete surviving is the one that matters, so it is verified.
  for (const id of heroPages.reverse()) await api('DELETE', `/pages/${id}`).catch(() => {})
  for (const id of heroSpaces) {
    await api('DELETE', `/spaces/${id}`).catch((e) => console.error(`cleanup: hero SPACE ${id} SURVIVED: ${e.message}`))
  }
  for (const id of made.reverse()) {
    await api('DELETE', `/pages/${id}`).catch((e) => { if (!/→ 404/.test(String(e))) console.warn(`cleanup: page ${id}: ${e.message}`) })
  }
  if (spaceId) {
    await api('DELETE', `/spaces/${spaceId}`).catch((e) => console.error(`cleanup: SPACE ${spaceId} SURVIVED — delete it by hand: ${e.message}`))
    const gone = await api('GET', `/spaces/${spaceId}/info`).then(() => false).catch(() => true)
    if (!gone) console.error(`cleanup: SPACE ${spaceId} still answers — the next run will photograph its leftovers`)
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  await browser.close()
}
console.log('done — manifest updated')
