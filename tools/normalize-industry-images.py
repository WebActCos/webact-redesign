from __future__ import annotations

from datetime import datetime
from pathlib import Path
import shutil
import sys

from PIL import Image, ImageChops, ImageStat


ROOT = Path(r"C:\webact.com")
IMAGE_DIR = ROOT / "industries" / "Industry Images"
BACKUP_DIR = (
    ROOT
    / "backups"
    / f"industry-images-before-normalization-{datetime.now():%Y%m%d-%H%M%S}"
)

CANVAS_WIDTH = 1600
CANVAS_HEIGHT = 900

# Amount of space retained around the visible website mockup.
CONTENT_WIDTH = 1420
CONTENT_HEIGHT = 760

# Match the industry-card image-area background.
CANVAS_COLOR = (238, 247, 253, 255)

# Controls how aggressively near-background pixels are trimmed.
BACKGROUND_TOLERANCE = 38


def average_corner_color(image: Image.Image) -> tuple[int, int, int, int]:
    """Estimate the source background from patches in all four corners."""
    rgba = image.convert("RGBA")
    width, height = rgba.size

    patch_width = max(8, min(width // 20, 60))
    patch_height = max(8, min(height // 20, 60))

    patches = [
        rgba.crop((0, 0, patch_width, patch_height)),
        rgba.crop((width - patch_width, 0, width, patch_height)),
        rgba.crop((0, height - patch_height, patch_width, height)),
        rgba.crop(
            (
                width - patch_width,
                height - patch_height,
                width,
                height,
            )
        ),
    ]

    values = []

    for patch in patches:
        stats = ImageStat.Stat(patch)
        values.append(tuple(round(channel) for channel in stats.mean))

    return tuple(
        round(sum(value[channel] for value in values) / len(values))
        for channel in range(4)
    )


def visible_bounds(image: Image.Image) -> tuple[int, int, int, int] | None:
    """Find content that differs meaningfully from the image background."""
    rgba = image.convert("RGBA")
    background_color = average_corner_color(rgba)

    background = Image.new("RGBA", rgba.size, background_color)
    difference = ImageChops.difference(rgba, background).convert("L")

    # Ignore very small color differences caused by compression or gradients.
    difference = difference.point(
        lambda value: 255 if value > BACKGROUND_TOLERANCE else 0
    )

    alpha = rgba.getchannel("A").point(
        lambda value: 255 if value > 20 else 0
    )

    mask = ImageChops.multiply(difference, alpha)
    return mask.getbbox()


def normalize_image(source_path: Path) -> bool:
    with Image.open(source_path) as source:
        source = source.convert("RGBA")
        bounds = visible_bounds(source)

        if bounds is None:
            print(f"SKIPPED — no visible content found: {source_path.name}")
            return False

        cropped = source.crop(bounds)

        scale = min(
            CONTENT_WIDTH / cropped.width,
            CONTENT_HEIGHT / cropped.height,
        )

        resized_width = max(1, round(cropped.width * scale))
        resized_height = max(1, round(cropped.height * scale))

        resized = cropped.resize(
            (resized_width, resized_height),
            Image.Resampling.LANCZOS,
        )

        canvas = Image.new(
            "RGBA",
            (CANVAS_WIDTH, CANVAS_HEIGHT),
            CANVAS_COLOR,
        )

        x = (CANVAS_WIDTH - resized_width) // 2
        y = (CANVAS_HEIGHT - resized_height) // 2

        canvas.alpha_composite(resized, (x, y))

        # PNG optimization is lossless.
        canvas.save(source_path, format="PNG", optimize=True)

        print(
            f"NORMALIZED: {source_path.name} "
            f"({source.width}x{source.height} -> "
            f"{resized_width}x{resized_height} on "
            f"{CANVAS_WIDTH}x{CANVAS_HEIGHT})"
        )

        return True


def main() -> int:
    if not IMAGE_DIR.exists():
        print(f"Image folder was not found: {IMAGE_DIR}")
        return 1

    image_paths = sorted(
        path
        for path in IMAGE_DIR.iterdir()
        if path.is_file() and path.suffix.lower() == ".png"
    )

    if not image_paths:
        print(f"No PNG files were found in: {IMAGE_DIR}")
        return 1

    BACKUP_DIR.mkdir(parents=True, exist_ok=False)

    for image_path in image_paths:
        shutil.copy2(image_path, BACKUP_DIR / image_path.name)

    print(f"\nBackup created at:\n{BACKUP_DIR}\n")

    normalized = 0

    for image_path in image_paths:
        try:
            if normalize_image(image_path):
                normalized += 1
        except Exception as exc:
            print(f"ERROR processing {image_path.name}: {exc}")

    print(f"\nNormalized {normalized} of {len(image_paths)} images.")
    return 0 if normalized else 1


if __name__ == "__main__":
    sys.exit(main())
