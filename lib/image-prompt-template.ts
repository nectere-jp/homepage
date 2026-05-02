/** A8 Nanobanana 共通スタイル（縦横比を含まない基本部分） */
const IMAGE_BASE_STYLE = `Bright, well-lit photograph in a Japanese everyday setting (home, school, park, or sports ground).
Clean natural lighting, cheerful and open atmosphere, vivid but realistic colors.
No faces visible (show only objects, hands, back views, or silhouettes).
No text, no logos, no watermarks, no Japanese characters (kanji, hiragana, katakana), no written characters of any language.

Avoid: faces, people looking at camera, dark or moody lighting, heavy shadows, underexposed images,
American baseball uniforms or MLB style, oversaturated neon colors,
stock photo aesthetic, cartoon or illustration style,
text overlays, watermarks, logos, posters, signs with letters,
any visible text or writing, books with readable text, whiteboards with writing, screens showing text.`;

/** 本文画像テンプレート（16:9 / 1920x1080） */
export const IMAGE_COMMON_TEMPLATE = `${IMAGE_BASE_STYLE}
Horizontal 16:9 aspect ratio (1920x1080).`;

/** サムネイル / OGP画像テンプレート（1.91:1 / 1200x630） */
export const IMAGE_THUMBNAIL_TEMPLATE = `${IMAGE_BASE_STYLE}
Horizontal 1.91:1 aspect ratio (1200x630). Eye-catching composition with clear focal point.`;
