/** A8 Nanobanana 共通スタイル（縦横比を含まない基本部分） */
const IMAGE_BASE_STYLE = `Modern Japanese lifestyle photograph, bright and airy high-key lighting,
soft diffused natural light from a large window, almost white overexposed background,
clean minimal interior with white walls, light wood furniture, and small green plants,
pastel and muted color palette, very light tones, gentle soft shadows,
shallow depth of field with creamy bokeh, calm and inviting atmosphere,
no faces visible (show only objects, hands, back views, or partial silhouettes),
no text, no logos, no watermarks, no Japanese characters, no written characters of any language.

Avoid: dark or moody lighting, heavy shadows, underexposed images, harsh contrast,
faces or people looking at camera, American baseball uniforms or MLB style,
oversaturated or neon colors, gritty or grainy film look, dramatic cinematic lighting,
stock photo with forced smiles, cartoon or illustration style,
text overlays, watermarks, logos, posters, signs with letters,
any visible text or writing, books with readable text, whiteboards with writing, screens showing text.`;

/** 本文画像テンプレート（16:9 / 1920x1080） */
export const IMAGE_COMMON_TEMPLATE = `${IMAGE_BASE_STYLE}
Horizontal 16:9 aspect ratio (1920x1080).`;

/** サムネイル / OGP画像テンプレート（1.91:1 / 1200x630） */
export const IMAGE_THUMBNAIL_TEMPLATE = `${IMAGE_BASE_STYLE}
Horizontal 1.91:1 aspect ratio (1200x630). Eye-catching composition with clear focal point.`;
