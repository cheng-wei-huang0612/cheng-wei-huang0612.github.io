# Repository Instructions

## Image privacy

- Keep original camera files under `raw_figures/`. This directory must remain ignored and must never be force-added to Git or published by GitHub Pages.
- Publish only resized derivatives under `figures/`; do not use `figures/` as storage for full-resolution source photos.
- Before committing or publishing personal photos, remove EXIF, XMP, IPTC, and other metadata that can expose GPS coordinates, capture time, device details, or editing history.
- Preserve the image's ICC color profile when sanitizing metadata so that removing private metadata does not change color rendering.
- After sanitizing an image, verify that sensitive fields are absent and that the image data itself is unchanged. A suitable check is `exiftool -ImageDataMD5 -EXIF:All -XMP:All -IPTC:All <files>`.
- Treat image metadata as a privacy review item for every new or replaced photo under `figures/`, even when the page does not display that metadata.
- Cleaning the current files does not remove metadata from earlier Git commits. Do not rewrite Git history or force-push solely to purge historical image metadata without explicit user authorization; report the remaining historical exposure instead.
