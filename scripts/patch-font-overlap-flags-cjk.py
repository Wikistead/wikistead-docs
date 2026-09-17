#!/usr/bin/env python3
"""Patch the Mac OVERLAP_SIMPLE / OVERLAP_COMPOUND glyf flags onto docs-site's vendored Noto Sans
JP and Plus Jakarta Sans faces.

ADR-307 (wikistead repo). Sibling of patch-font-overlap-flags.py (Inter-only, Phase (1), untouched
by this script). Maintenance-time-only tool: never invoked by `pnpm install`, `pnpm build`, or CI.
Run by a developer when `@fontsource/noto-sans-jp` or `@fontsource/plus-jakarta-sans` is upgraded,
or when a new weight is added to astro.config.mjs's `customCss` list.

Every self-hosted @fontsource woff2 this product ships omits Apple's OVERLAP_SIMPLE glyf flag
(0x40): Apple's CoreText/Quartz rasterizer needs it set to resolve overlapping contours with a
nonzero fill rule, and without it, multi-contour glyphs (nearly every CJK ideograph, and many Latin
glyphs) render with visibly reversed-fill intersections on a real Mac. Linux/Windows browsers
(Skia/FreeType) always use nonzero fill and never look at the flag, so the defect is invisible on
this machine.

Requires fontTools 4.64+ (see docs/adr/307-... "Rejected (rev1)" in the main wikistead repo for why
an older fontTools cannot round-trip the WOFF2 overlapSimpleBitmap correctly).

Discovery is CSS-driven, never a hand-maintained slice list: this script parses
node_modules/@fontsource/<family>/<weight>.css, finds every comment-delimited @font-face block
(`/* <family>-<slice>-<weight>-normal */`), and patches only the referenced files. Noto Sans JP's
slices are a mix of bracketed numeric ids in the comment (`[0]`, `[1]`, ... -- NOT bracketed in the
filename, e.g. `noto-sans-jp-1-400-normal.woff2`) and bare names (`cyrillic`, `japanese`, `latin`,
`latin-ext`, `vietnamese`); Plus Jakarta Sans uses bare names only. The block regex binds the
filename's own slice+weight back to the comment's slice+weight via named-group backreferences (a
conditional backreference, `(?(num)...|...)`, to bridge the bracketed-vs-bare mismatch) rather than
accepting whatever filename follows the comment -- this is the same safety property
apps/web/scripts/patch-font-overlap-flags.py's discover_slices() docstring documents: a prior
version of docs-site's own parity checker (check-font-overlap-flags.mjs) compared range/weight
strings pulled from the FILENAME to each other, never back to the block's own comment, which let a
declaration's `src` silently point at the wrong slice/weight and still pass.

Output: docs-site/public/fonts/<family>/<slice>.woff2 (matching public/fonts/inter/'s convention;
NOT public/brand/fonts/, which is exclusively scripts/pull-generated.mjs's own managed output).

This script also generates docs-site/src/styles/<family>.css: one @font-face rule per discovered
slice, `unicode-range` copied byte-for-byte from the same parsed block (so the CSS can never drift
from what was actually patched), `font-display: swap`, woff2-only (no `.woff` fallback, matching
inter.css's precedent), ordered by weight then by the slice's order of appearance in the source CSS.

Noto Sans JP and Plus Jakarta Sans both ship under OFL-1.1 with no Reserved Font Name clause
(verified against node_modules/@fontsource/{noto-sans-jp,plus-jakarta-sans}/LICENSE's own copyright
header -- same boilerplate "Reserved Font Name" definition paragraph as Inter's LICENSE, no actual
reserved name listed), so no family rename is needed -- the patched files keep each family's own
CSS `font-family` name.
"""

import re
import shutil
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import setMacOverlapFlags

DOCS_SITE = Path(__file__).resolve().parent.parent
FONTSOURCE_ROOT = DOCS_SITE / "node_modules" / "@fontsource"
PUBLIC_FONTS = DOCS_SITE / "public" / "fonts"
STYLES_DIR = DOCS_SITE / "src" / "styles"
TESTDATA_DIR = DOCS_SITE / "scripts" / "testdata"

# One entry per vendored family: (package dir name, CSS font-family value, weights imported in
# astro.config.mjs, (slice, weight) to use for the negative break-check fixture).
FAMILIES = [
    {
        "pkg": "noto-sans-jp",
        "css_family": "Noto Sans JP",
        "weights": (400, 500, 700),
        "fixture": ("latin", 400),
        "license_name": "LICENSE-NotoSansJP.txt",
    },
    {
        "pkg": "plus-jakarta-sans",
        "css_family": "Plus Jakarta Sans",
        "weights": (600,),
        "fixture": ("latin", 600),
        "license_name": "LICENSE-PlusJakartaSans.txt",
    },
]


def make_block_re(pkg: str) -> re.Pattern:
    fam = re.escape(pkg)
    return re.compile(
        rf"/\*\s*{fam}-(?:\[(?P<num>\d+)\]|(?P<name>[a-z]+(?:-[a-z]+)*))-(?P<weight>\d+)-normal\s*\*/"
        rf"(?P<block>.*?)"
        rf"src:\s*url\(\./files/{fam}-(?(num)(?P=num)|(?P=name))-(?P=weight)-normal\.woff2\)[^;]*;\s*\n?"
        rf"\s*unicode-range:\s*(?P<range>[^;]+);",
        re.DOTALL,
    )


def discover_slices(pkg: str, weight: int) -> list[dict]:
    """Return [{slice, filename, range}] for every @font-face block in <pkg>/<weight>.css, in the
    order they appear in the source file."""
    css_path = FONTSOURCE_ROOT / pkg / f"{weight}.css"
    css = css_path.read_text(encoding="utf-8")
    block_re = make_block_re(pkg)
    found = []
    for m in block_re.finditer(css):
        slice_id = m.group("num") if m.group("num") is not None else m.group("name")
        filename = f"{pkg}-{slice_id}-{weight}-normal.woff2"
        found.append({"slice": slice_id, "filename": filename, "range": m.group("range").strip()})

    # Self-consistency check: every `/* pkg-...-normal */` comment in the file must have produced a
    # match. A silent formatting mismatch (e.g. a slice this regex's alternation doesn't cover) would
    # otherwise under-count without raising -- caught here by comparing to a simpler, independent count.
    comment_count = len(re.findall(rf"/\*\s*{re.escape(pkg)}-.+?-{weight}-normal\s*\*/", css))
    if len(found) != comment_count:
        raise RuntimeError(
            f"{css_path}: block regex matched {len(found)} @font-face block(s) but the file has "
            f"{comment_count} '{pkg}-...-{weight}-normal' comment(s) -- discovery is under-counting."
        )
    if not found:
        raise RuntimeError(f"{css_path}: discovered 0 @font-face blocks")
    return found


def patch_one(src_file: Path, dest_file: Path) -> None:
    font = TTFont(src_file)
    setMacOverlapFlags(font["glyf"])
    dest_file.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff2"
    font.save(dest_file)


def css_for_family(pkg: str, css_family: str, by_weight: dict) -> str:
    header = f"""/* Mac-safe {css_family} (ADR-307): the SAME slices `@fontsource/{pkg}/*.css` serves
   (copied byte-for-byte per (weight, slice) below), but pointed at locally vendored files that
   carry the Apple OVERLAP_SIMPLE/OVERLAP_COMPOUND glyf flags `@fontsource`'s own files omit --
   without those flags, CoreText/Quartz on a real Mac renders multi-contour glyphs (nearly every
   CJK ideograph, and many Latin glyphs) with visibly reversed-fill intersections. Regenerate with
   `python3 scripts/patch-font-overlap-flags-cjk.py` (fontTools 4.64+) whenever `@fontsource/{pkg}`
   is upgraded or a new weight/slice is added.

   `unicode-range` values below are copied byte-for-byte from the corresponding
   `node_modules/@fontsource/{pkg}/NNN.css` block -- pinned by
   scripts/check-font-overlap-flags.mjs -- so the existing per-slice lazy-loading behavior is
   unchanged. Only woff2 is served (no .woff fallback), matching inter.css's precedent. */
"""
    rules = []
    for weight in sorted(by_weight.keys()):
        for entry in by_weight[weight]:
            rules.append(
                "@font-face {\n"
                f"  font-family: '{css_family}';\n"
                "  font-style: normal;\n"
                "  font-display: swap;\n"
                f"  font-weight: {weight};\n"
                f"  src: url('/fonts/{pkg}/{entry['filename']}') format('woff2');\n"
                f"  unicode-range: {entry['range']};\n"
                "}"
            )
    return header + "\n" + "\n".join(rules) + "\n"


def main() -> None:
    TESTDATA_DIR.mkdir(parents=True, exist_ok=True)
    STYLES_DIR.mkdir(parents=True, exist_ok=True)

    for family in FAMILIES:
        pkg = family["pkg"]
        fontsource_dir = FONTSOURCE_ROOT / pkg
        out_dir = PUBLIC_FONTS / pkg
        out_dir.mkdir(parents=True, exist_ok=True)

        license_src = fontsource_dir / "LICENSE"
        if not license_src.exists():
            raise RuntimeError(f"missing LICENSE for {pkg}: {license_src}")

        by_weight: dict[int, list[dict]] = {}
        patched = []
        for weight in family["weights"]:
            slices = discover_slices(pkg, weight)
            by_weight[weight] = slices
            for entry in slices:
                src_file = fontsource_dir / "files" / entry["filename"]
                if not src_file.exists():
                    raise RuntimeError(f"missing source file: {src_file}")
                dest_file = out_dir / entry["filename"]
                patch_one(src_file, dest_file)
                patched.append(dest_file.name)
            print(f"{pkg}: discovered/patched {len(slices)} slice(s) at weight {weight}")

        discovered_total = sum(len(v) for v in by_weight.values())
        if len(patched) != discovered_total:
            print(
                f"error: {pkg}: expected {discovered_total} patched files (from CSS discovery), "
                f"got {len(patched)}",
                file=sys.stderr,
            )
            sys.exit(1)
        print(f"{pkg}: patched {len(patched)}/{discovered_total} discovered file(s) -> {out_dir.relative_to(DOCS_SITE)}")

        # LICENSE, mirroring public/fonts/inter/LICENSE-Inter.txt's naming.
        license_dest = out_dir / family["license_name"]
        shutil.copyfile(license_src, license_dest)
        print(f"{pkg}: wrote {license_dest.relative_to(DOCS_SITE)}")

        # Break-check fixture (C5-equivalent): one deliberately-unpatched copy.
        fixture_slice, fixture_weight = family["fixture"]
        fixture_entry = next(
            (e for e in by_weight[fixture_weight] if e["slice"] == fixture_slice), None
        )
        if fixture_entry is None:
            raise RuntimeError(
                f"{pkg}: fixture slice '{fixture_slice}' at weight {fixture_weight} not found among "
                f"discovered slices -- cannot write break-check fixture"
            )
        fixture_src = fontsource_dir / "files" / fixture_entry["filename"]
        fixture_dest = TESTDATA_DIR / f"{fixture_entry['filename'].removesuffix('.woff2')}.unpatched.woff2"
        shutil.copyfile(fixture_src, fixture_dest)
        print(f"{pkg}: wrote unpatched break-check fixture -> {fixture_dest.relative_to(DOCS_SITE)}")

        # CSS stylesheet, generated programmatically from the exact same discovered blocks (so it
        # cannot drift from what was patched).
        css_dest = STYLES_DIR / f"{pkg}.css"
        css_dest.write_text(css_for_family(pkg, family["css_family"], by_weight), encoding="utf-8")
        print(f"{pkg}: wrote {css_dest.relative_to(DOCS_SITE)}")


if __name__ == "__main__":
    main()
