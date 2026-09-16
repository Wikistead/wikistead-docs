#!/usr/bin/env python3
"""Patch the Mac OVERLAP_SIMPLE / OVERLAP_COMPOUND glyf flags onto docs-site's vendored Inter faces.

ADR-307 (wikistead repo, Phase (1)). Maintenance-time-only tool: never invoked by `pnpm install`,
`pnpm build`, or CI. Run by a developer when `@fontsource/inter` is upgraded, or when a new weight
is added to astro.config.mjs's `customCss` list.

Every self-hosted @fontsource woff2 this product ships omits Apple's OVERLAP_SIMPLE glyf flag
(0x40): Apple's CoreText/Quartz rasterizer needs it set to resolve overlapping contours with a
nonzero fill rule, and without it, multi-contour glyphs (k, x, t, A, and nearly every CJK
ideograph) render with visibly reversed-fill intersections on a real Mac. Linux/Windows browsers
(Skia/FreeType) always use nonzero fill and never look at the flag, so the defect is invisible on
this machine.

Requires fontTools 4.64+ (this project's Python environment, not a project dependency — see
docs/adr/307-... "Rejected (rev1)" in the main wikistead repo for why an older fontTools cannot
round-trip the WOFF2 overlapSimpleBitmap correctly).

Discovery is CSS-driven, never a hand-maintained file list: this script parses
node_modules/@fontsource/inter/{400,500,600,700}.css, finds each weight's `latin` and `latin-ext`
comment-delimited @font-face block, and patches only the referenced files -- so a future weight
added to astro.config.mjs is picked up by re-running this script, not by remembering a second
place to update.

Output: docs-site/public/fonts/inter/<slice>.woff2 (NOT public/brand/fonts/ -- that subtree is
exclusively scripts/pull-generated.mjs's own managed brand-kit output).

Inter ships under OFL-1.1 with no Reserved Font Name clause (verified against
node_modules/@fontsource/inter/LICENSE's own copyright header), so no family rename is needed --
the patched files keep Inter's own family name.
"""

import re
import shutil
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import setMacOverlapFlags

DOCS_SITE = Path(__file__).resolve().parent.parent
FONTSOURCE_DIR = DOCS_SITE / "node_modules" / "@fontsource" / "inter"
OUT_DIR = DOCS_SITE / "public" / "fonts" / "inter"
TESTDATA_DIR = DOCS_SITE / "scripts" / "testdata"
WEIGHTS = (400, 500, 600, 700)
RANGES = ("latin", "latin-ext")

# Matches: `/* inter-latin-400-normal */` followed eventually by `src: url(./files/NAME.woff2) ...`
BLOCK_RE = re.compile(
    r"/\*\s*inter-(?P<range>latin(?:-ext)?)-(?P<weight>\d+)-normal\s*\*/.*?"
    r"src:\s*url\(\./files/(?P<file>inter-(?:latin(?:-ext)?)-\d+-normal\.woff2)\)",
    re.DOTALL,
)


def discover_slices(weight: int) -> dict[str, str]:
    """Return {range: filename} for the `latin`/`latin-ext` blocks in weight NNN.css."""
    css_path = FONTSOURCE_DIR / f"{weight}.css"
    css = css_path.read_text(encoding="utf-8")
    found: dict[str, str] = {}
    for m in BLOCK_RE.finditer(css):
        rng = m.group("range")
        if rng in RANGES:
            found[rng] = m.group("file")
    missing = set(RANGES) - found.keys()
    if missing:
        raise RuntimeError(f"{css_path}: could not find block(s) for {sorted(missing)}")
    return found


def patch_one(src_file: Path, dest_file: Path) -> None:
    font = TTFont(src_file)
    setMacOverlapFlags(font["glyf"])
    dest_file.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(dest_file)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    TESTDATA_DIR.mkdir(parents=True, exist_ok=True)

    patched = []
    for weight in WEIGHTS:
        slices = discover_slices(weight)
        for rng, filename in slices.items():
            src_file = FONTSOURCE_DIR / "files" / filename
            if not src_file.exists():
                raise RuntimeError(f"missing source file: {src_file}")
            dest_file = OUT_DIR / filename
            patch_one(src_file, dest_file)
            patched.append(dest_file.name)
            print(f"patched {filename} ({rng} {weight}) -> {dest_file.relative_to(DOCS_SITE)}")

    # Break-check fixture (C5-equivalent): one deliberately-unpatched copy, committed alongside
    # the patched files, so the pin's reader can be proven to still go red.
    fixture_src = FONTSOURCE_DIR / "files" / "inter-latin-400-normal.woff2"
    fixture_dest = TESTDATA_DIR / "inter-latin-400-normal.unpatched.woff2"
    shutil.copyfile(fixture_src, fixture_dest)
    print(f"wrote unpatched break-check fixture -> {fixture_dest.relative_to(DOCS_SITE)}")

    if len(patched) != 8:
        print(f"error: expected 8 patched files, got {len(patched)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
