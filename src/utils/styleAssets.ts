/**
 * Local art style preview images bundled with the app
 * These are used as fallbacks when preview_image_url is not set in the database
 */

export const STYLE_PREVIEW_IMAGES: Record<string, any> = {
  watercolor_whimsy: require('../../assets/style-previews/watercolor_whimsy.jpg'),
  bright_cartoon: require('../../assets/style-previews/bright_cartoon.jpg'),
  storybook_classic: require('../../assets/style-previews/storybook_classic.jpg'),
  paper_cutout: require('../../assets/style-previews/paper_cutout.jpg'),
  soft_digital: require('../../assets/style-previews/soft_digital.jpg'),
  crayon_charm: require('../../assets/style-previews/crayon_charm.jpg'),
};

/**
 * Get the preview image source for an art style
 * Returns the database URL if available, otherwise falls back to local asset
 */
export function getStylePreviewSource(
  styleName: string,
  previewImageUrl: string | null
): { uri: string } | number {
  if (previewImageUrl) {
    return { uri: previewImageUrl };
  }
  return STYLE_PREVIEW_IMAGES[styleName] || STYLE_PREVIEW_IMAGES.watercolor_whimsy;
}
