# TT2020 Style E

Copyright © 2020 Fredrick R. Brennan. Licensed under SIL OFL 1.1; see
[OFL.txt](OFL.txt). This is a Latin-subset derivative of the regular Style E
font — the middle-ink cut of TT2020, between Style D (faded) and Style B
(heavy) — preserving its contextual glyph alternates and monospaced metrics.
Chinese characters fall back to KingHwa Old Song through the site's font stack.

Source: https://github.com/ctrlcctrlv/TT2020
Pinned revision: `0cf038022b1d541381744a8969a58d55110a0a23`
Source file: `dist/TT2020StyleE-Regular.ttf`

To regenerate (Python with FontTools 4.66.1 and Brotli 1.2.0):

```sh
curl -fL https://raw.githubusercontent.com/ctrlcctrlv/TT2020/0cf038022b1d541381744a8969a58d55110a0a23/dist/TT2020StyleE-Regular.ttf -o /tmp/TT2020StyleE-Regular.ttf
pyftsubset /tmp/TT2020StyleE-Regular.ttf \
  --output-file=public/fonts/tt2020/tt2020-style-e-latin-400-normal.woff2 \
  --flavor=woff2 \
  --unicodes='U+0000-00FF,U+0100-024F,U+1E00-1EFF,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212' \
  --layout-features='*' --name-IDs='*' --name-legacy --name-languages='*'
```

Only the regular face is shipped; code does not require a separate italic or
bold font. The subset is approximately 807 KiB (worn contours carry many
points; Style D's faded cut was ~349 KiB) and is loaded on demand, not
preloaded on pages without code.
