import { analyzeChildPhotos } from './characterConsistency';
import { generateStoryNarrative, validateStoryContent } from './storyGenerator';
import { generateStoryImage, validateImagePrompt } from './imageGenerator';
import { uploadStoryImage } from '@/services/supabase/storage';
import {
  createStory,
  updateStory,
  createStoryPages,
  updateStoryPage,
  getThemeById,
  getArtStyleById,
  getChildById,
} from '@/services/supabase/database';
import { GenerationProgress, StoryNarrative, StoryPageInsert } from '@/types';
import { DEFAULT_PAGE_COUNT, STORY_STATUS, PAGE_STATUS } from '@/utils/constants';
import { imageToBase64 } from '@/utils/helpers';

interface StoryCreationInput {
  userId: string;
  childId: string;
  themeId: string;
  artStyleId: string;
}

type ProgressCallback = (progress: GenerationProgress) => void;

/**
 * Orchestrate the complete story generation process
 */
export async function createCompleteStory(
  input: StoryCreationInput,
  onProgress?: ProgressCallback
): Promise<string> {
  const { userId, childId, themeId, artStyleId } = input;

  // Stage 1: Load data and analyze photos
  onProgress?.({
    stage: 'analyzing',
    currentPage: 0,
    totalPages: DEFAULT_PAGE_COUNT,
    message: 'Loading child profile...',
  });

  const [child, theme, artStyle] = await Promise.all([
    getChildById(childId),
    getThemeById(themeId),
    getArtStyleById(artStyleId),
  ]);

  if (!child) throw new Error('Child not found');
  if (!theme) throw new Error('Theme not found');
  if (!artStyle) throw new Error('Art style not found');

  // Get or generate character description
  let characterDescription = child.character_description;

  if (!characterDescription && child.primary_photo_url) {
    onProgress?.({
      stage: 'analyzing',
      currentPage: 0,
      totalPages: DEFAULT_PAGE_COUNT,
      message: 'Analyzing photos...',
    });

    const photoUrls = [child.primary_photo_url, ...(child.additional_photos || [])].filter(Boolean);
    characterDescription = await analyzeChildPhotos(
      photoUrls,
      child.name,
      child.age_years ?? undefined,
      child.gender ?? undefined
    );
  }

  if (!characterDescription) {
    characterDescription = `A young child named ${child.name}`;
  }

  // Create story record
  const story = await createStory({
    user_id: userId,
    child_id: childId,
    title: `${child.name}'s Adventure`, // Temporary title
    theme_id: themeId,
    art_style_id: artStyleId,
    status: 'generating',
    total_pages: DEFAULT_PAGE_COUNT,
  });

  try {
    // Stage 2: Generate story narrative
    onProgress?.({
      stage: 'writing',
      currentPage: 0,
      totalPages: DEFAULT_PAGE_COUNT,
      message: 'Crafting the story...',
    });

    const narrative = await generateStoryNarrative({
      childName: child.name,
      childAge: child.age_years ?? undefined,
      childGender: child.gender ?? undefined,
      theme,
      characterDescription,
      pageCount: DEFAULT_PAGE_COUNT,
    });

    // Validate content
    const validation = validateStoryContent(narrative);
    if (!validation.valid) {
      console.warn('Story validation issues:', validation.issues);
    }

    // Update story title
    await updateStory(story.id, { title: narrative.title });

    // Create page records
    const pageInserts: StoryPageInsert[] = narrative.pages.map((page) => ({
      story_id: story.id,
      page_number: page.pageNumber,
      narrative_text: page.text,
      image_prompt: page.imagePrompt,
      status: 'pending',
    }));

    const pages = await createStoryPages(pageInserts);

    // Stage 3: Generate illustrations
    for (let i = 0; i < narrative.pages.length; i++) {
      const pageNarrative = narrative.pages[i];
      const pageRecord = pages.find((p) => p.page_number === pageNarrative.pageNumber);

      if (!pageRecord) continue;

      onProgress?.({
        stage: 'illustrating',
        currentPage: i + 1,
        totalPages: narrative.pages.length,
        message: `Creating illustration ${i + 1} of ${narrative.pages.length}...`,
      });

      // Mark page as generating
      await updateStoryPage(pageRecord.id, { status: 'generating' });

      // Validate prompt
      const promptValidation = validateImagePrompt(pageNarrative.imagePrompt);
      if (!promptValidation.valid) {
        console.warn(`Invalid prompt for page ${i + 1}:`, promptValidation.reason);
      }

      // Generate image
      const image = await generateStoryImage({
        artStyleModifier: artStyle.prompt_modifier,
        characterDescription,
        childName: child.name,
        sceneDescription: pageNarrative.sceneDescription,
        imagePrompt: pageNarrative.imagePrompt,
      });

      // Upload to storage
      const imageUrl = await uploadStoryImage(story.id, pageNarrative.pageNumber, image.base64);

      // Update page with image
      await updateStoryPage(pageRecord.id, {
        image_url: imageUrl,
        status: 'completed',
      });

      // Set cover image from first page
      if (i === 0) {
        await updateStory(story.id, { cover_image_url: imageUrl });
      }
    }

    // Stage 4: Finalize
    onProgress?.({
      stage: 'finalizing',
      currentPage: narrative.pages.length,
      totalPages: narrative.pages.length,
      message: 'Finishing up...',
    });

    await updateStory(story.id, { status: 'completed' });

    return story.id;
  } catch (error) {
    // Mark story as failed
    await updateStory(story.id, { status: 'failed' });
    throw error;
  }
}

/**
 * Regenerate a single page's illustration
 */
export async function regeneratePageIllustration(
  storyId: string,
  pageId: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const [storyData] = await Promise.all([
    import('@/services/supabase/database').then((m) => m.getStoryWithPages(storyId)),
  ]);

  if (!storyData) throw new Error('Story not found');

  const { story, pages } = storyData;
  const page = pages.find((p) => p.id === pageId);

  if (!page) throw new Error('Page not found');

  // Load related data
  const [child, artStyle] = await Promise.all([
    getChildById(story.child_id),
    getArtStyleById(story.art_style_id),
  ]);

  if (!child || !artStyle) throw new Error('Missing story data');

  onProgress?.({
    stage: 'illustrating',
    currentPage: page.page_number,
    totalPages: story.total_pages,
    message: 'Regenerating illustration...',
  });

  // Mark page as generating
  await updateStoryPage(pageId, { status: 'generating' });

  // Generate new image
  const image = await generateStoryImage({
    artStyleModifier: artStyle.prompt_modifier,
    characterDescription: child.character_description || `A child named ${child.name}`,
    childName: child.name,
    sceneDescription: page.image_prompt || '',
    imagePrompt: page.image_prompt || '',
  });

  // Upload new image
  const imageUrl = await uploadStoryImage(story.id, page.page_number, image.base64);

  // Update page
  await updateStoryPage(pageId, {
    image_url: imageUrl,
    status: 'completed',
    regeneration_count: (page.regeneration_count || 0) + 1,
  });

  // Update cover if this is page 1
  if (page.page_number === 1) {
    await updateStory(storyId, { cover_image_url: imageUrl });
  }
}
