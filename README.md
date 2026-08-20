# Wikistead documentation

The public documentation site for [Wikistead](https://github.com/wikistead/wikistead) — built with
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build), fully static, English and
Japanese from day one.

## How this repo stays honest

- **The site documents a released version, not the tip.** `SOURCE_TAG` pins the source tag;
  `scripts/pull-generated.mjs` pulls the generated references (`docs/generated/*.md`) from that tag
  at build time and fails on a torn pull once the source emits its `.source-version` marker. In the
  dev overlay position (this repo cloned as `docs-site/` inside the source checkout) it copies from
  the sibling working tree instead and says so.
- **EE badges trace to the catalog.** `scripts/check-ee-badges.mjs` reconciles every page's
  `wikisteadEeLevers` declaration against the generated entitlement-levers reference (derived from
  the source catalog's `edition` field) — in both directions, in both locales. There is no
  hand-kept list of EE features anywhere in this repo.
- **EE pages describe WHAT a capability does, never how it is built.** Implementation and internal
  design are out of scope for end-user docs.
- **Nothing ships undocumented.** The source repository's CI walks its own registries (macros,
  screens, admin surfaces) and fails when a registered surface has no docs binding — the bindings
  name pages in this repo.

## Commands

```
pnpm install
pnpm build      # pull generated refs → reconcile EE badges → astro build (en + ja)
pnpm dev        # local preview
pnpm license:check
```

## Contributing

Issues are welcome; pull requests are not accepted (same stance as the source repository).

## License

License to be added by the repository owner before publishing.
