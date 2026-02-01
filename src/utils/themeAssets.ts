/**
 * Local theme preview images bundled with the app
 * These are used as fallbacks when preview_image_url is not set in the database
 */

export const THEME_PREVIEW_IMAGES: Record<string, any> = {
  space_adventure: require('../../assets/theme-previews/space_adventure.jpg'),
  underwater_explorer: require('../../assets/theme-previews/underwater_explorer.jpg'),
  enchanted_forest: require('../../assets/theme-previews/enchanted_forest.jpg'),
  dinosaur_land: require('../../assets/theme-previews/dinosaur_land.jpg'),
  superhero_academy: require('../../assets/theme-previews/superhero_academy.jpg'),
  fairy_tale_kingdom: require('../../assets/theme-previews/fairy_tale_kingdom.jpg'),
  safari_adventure: require('../../assets/theme-previews/safari_adventure.jpg'),
  arctic_expedition: require('../../assets/theme-previews/arctic_expedition.jpg'),
};

/**
 * Get the preview image source for a theme
 * Returns the database URL if available, otherwise falls back to local asset
 */
export function getThemePreviewSource(
  themeName: string,
  previewImageUrl: string | null
): { uri: string } | number {
  if (previewImageUrl) {
    return { uri: previewImageUrl };
  }
  return THEME_PREVIEW_IMAGES[themeName] || THEME_PREVIEW_IMAGES.space_adventure;
}
