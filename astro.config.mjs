// Wikistead docs site (ADR-225, #697/#703). Astro + Starlight, fully static, public.
// en is the root locale (clean URLs); ja lives under /ja/ (en + ja from launch, #703).
import { defineConfig, passthroughImageService } from 'astro/config'
import starlight from '@astrojs/starlight'

export default defineConfig({
  // No sharp: its libvips prebuilds are LGPL, outside the root licence policy (ADR-011), and a
  // docs site of markdown pages needs no image pipeline. sharp is removed via pnpm overrides and
  // the image service is the passthrough one — if images ever need optimisation, that is a
  // licence-boundary decision to take deliberately, not a default to inherit.
  image: { service: passthroughImageService() },
  // #180: `docs.<apex>` on the apex domain (`wikistead.com`), which is
  // the split ADR-225 chose. Settled ahead of the hosting choice on purpose: this is the canonical
  // origin every sitemap entry and every cross-page link is written against, and it is a fact about
  // the domain rather than about which service ends up serving the built files.
  site: 'https://docs.wikistead.com',
  integrations: [
    starlight({
      title: 'Wikistead Docs',
      logo: { src: './src/assets/mark.svg', alt: 'Wikistead' }, // #709: the tile-less mark (icon-solid.svg has the tile baked in)
      favicon: '/favicon.svg',
      customCss: [
        // #709: the faces the KIT's type tokens name, delivered the same way the product delivers
        // them (@fontsource, self-hosted, OFL) at the product's own weights. The kit carries the
        // token VALUES; these packages carry the glyphs.
        '@fontsource/inter/400.css',
        '@fontsource/inter/500.css',
        '@fontsource/inter/600.css',
        '@fontsource/inter/700.css',
        '@fontsource/noto-sans-jp/400.css',
        '@fontsource/noto-sans-jp/500.css',
        '@fontsource/noto-sans-jp/700.css',
        '@fontsource/plus-jakarta-sans/600.css',
        './src/styles/brand.css', // #706: the pulled brand kit dresses Starlight
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        ja: { label: '日本語', lang: 'ja' },
      },
      components: {
        // #718: the generated references are English by design, not by
        // backlog. The override says so; every other fallback keeps Starlight's wording.
        FallbackContentNotice: './src/components/FallbackContentNotice.astro',
      },
      sidebar: [
        { label: 'Getting started', translations: { ja: 'はじめる' }, items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Editor', translations: { ja: 'エディタ' }, items: [{ autogenerate: { directory: 'editor' } }] },
        { label: 'Guides', translations: { ja: 'ガイド' }, items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'Publishing', translations: { ja: '公開' }, items: [{ autogenerate: { directory: 'publishing' } }] },
        { label: 'Integrations', translations: { ja: '連携' }, items: [{ autogenerate: { directory: 'integrations' } }] },
        { label: 'Admin', translations: { ja: '管理' }, items: [{ autogenerate: { directory: 'admin' } }] },
        { label: 'Settings', translations: { ja: '設定' }, items: [{ autogenerate: { directory: 'settings' } }] },
        { label: 'Reference', translations: { ja: 'リファレンス' }, items: [{ autogenerate: { directory: 'reference' } }] },
      ],
    }),
  ],
})
