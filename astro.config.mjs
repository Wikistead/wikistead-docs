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
  site: 'https://docs.wikistead.example', // real apex decided with the LP before publishing (ADR-225 §Open 3)
  integrations: [
    starlight({
      title: 'Wikistead Docs',
      logo: { src: './src/assets/icon-solid.svg', alt: 'Wikistead' },
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
      sidebar: [
        { label: 'Getting started', translations: { ja: 'はじめる' }, items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Editor', translations: { ja: 'エディタ' }, items: [{ autogenerate: { directory: 'editor' } }] },
        { label: 'Guides', translations: { ja: 'ガイド' }, items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'Publishing', translations: { ja: '公開' }, items: [{ autogenerate: { directory: 'publishing' } }] },
        { label: 'Admin', translations: { ja: '管理' }, items: [{ autogenerate: { directory: 'admin' } }] },
        { label: 'Settings', translations: { ja: '設定' }, items: [{ autogenerate: { directory: 'settings' } }] },
        { label: 'Reference', translations: { ja: 'リファレンス' }, items: [{ autogenerate: { directory: 'reference' } }] },
      ],
    }),
  ],
})
