/** A8 Nanobanana 共通スタイル（縦横比を含まない基本部分） */
const IMAGE_BASE_STYLE = `Cinematic documentary-style photograph, Japanese household or school setting,
natural lighting with warm color grading, soft film grain,
slightly desaturated colors with warm undertones but readable brightness,
no faces visible (composition shows only objects, hands, back views,
or silhouettes), shallow depth of field, 35mm film aesthetic,
quiet and contemplative mood, no text, no logos, no watermarks,
no Japanese text, no kanji, no hiragana, no katakana, no written characters of any language.

Avoid: faces, people looking at camera, smiling people,
American baseball uniforms or MLB style, oversaturated colors,
harsh lighting, stock photo aesthetic, cartoon or illustration style,
text overlays, watermarks, logos, posters, signs with letters,
any visible text or writing (Japanese, English, or otherwise),
books with readable text, whiteboards with writing, screens showing text.`;

/** 本文画像テンプレート（16:9 / 1920x1080） */
export const IMAGE_COMMON_TEMPLATE = `${IMAGE_BASE_STYLE}
Horizontal 16:9 aspect ratio (1920x1080), optimized for blog article body.`;

/** サムネイル / OGP画像テンプレート（1.91:1 / 1200x630） */
export const IMAGE_THUMBNAIL_TEMPLATE = `${IMAGE_BASE_STYLE}
Horizontal 1.91:1 aspect ratio (1200x630), optimized for OGP / social media thumbnail. Eye-catching composition with clear focal point.`;
