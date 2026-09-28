-- Restore the operational data and storage that can disappear after an
-- incomplete manual setup, then harden the original schema. This migration is
-- deliberately idempotent and does not delete user-owned rows.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('child-photos', 'child-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('story-images', 'story-images', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO public.themes (name, display_name, description, base_prompt)
VALUES
  ('space_adventure', 'Space Adventure', 'Blast off to the stars and explore the galaxy!', 'Create a story where the child is an astronaut exploring outer space. They should visit different planets, meet friendly aliens, and discover cosmic wonders. The story should be full of wonder and excitement about space exploration. Include elements like rockets, stars, moons, and colorful planets.'),
  ('underwater_explorer', 'Underwater Explorer', 'Dive deep into the ocean and meet sea creatures!', 'Create a story where the child is an underwater explorer with special diving gear. They should meet friendly sea creatures like dolphins, colorful fish, and gentle whales. The story should explore coral reefs, underwater caves, and discover a treasure chest. The ocean should feel magical and full of wonders.'),
  ('enchanted_forest', 'Enchanted Forest', 'Discover magic in a mystical woodland!', 'Create a story where the child discovers a magical forest. They should meet talking animals, helpful fairies, and find enchanted objects. The story should include a gentle quest like helping a lost baby animal find its way home. The forest should feel warm, safe, and full of wonder.'),
  ('dinosaur_land', 'Dinosaur Land', 'Travel back in time to meet friendly dinosaurs!', 'Create a story where the child travels back in time to meet friendly dinosaurs. They should make friends with a baby dinosaur and go on an adventure together. Include different types of dinosaurs, but make them friendly and playful. The prehistoric world should feel exciting but safe.'),
  ('superhero_academy', 'Superhero Academy', 'Discover your superpowers and save the day!', 'Create a story where the child discovers they have a special superpower and joins a superhero academy. They should learn to use their powers for good and help solve a problem in their community. The story should emphasize kindness, bravery, and helping others.'),
  ('fairy_tale_kingdom', 'Fairy Tale Kingdom', 'Become royalty in a magical kingdom!', 'Create a story where the child is a prince or princess in a magical kingdom. They should go on a quest to help their kingdom, meet magical creatures, and show kindness to everyone they meet. The story should have a happy ending where their kindness is rewarded.'),
  ('safari_adventure', 'Safari Adventure', 'Go on a wild journey through the savanna!', 'Create a story where the child goes on a safari adventure in Africa. They should meet different animals and help an animal in need. The savanna should feel vast, sunny, and full of wildlife.'),
  ('arctic_expedition', 'Arctic Expedition', 'Explore the frozen north and meet polar animals!', 'Create a story where the child is an arctic explorer discovering the frozen north. They should meet polar animals, perhaps help build an igloo, and watch the northern lights. The arctic should feel magical with snow, ice, and aurora borealis.')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  base_prompt = EXCLUDED.base_prompt,
  is_active = true;

INSERT INTO public.art_styles (name, display_name, description, prompt_modifier)
VALUES
  ('watercolor_whimsy', 'Watercolor Whimsy', 'Soft, dreamy watercolor illustrations', 'Style: Soft watercolor illustration with gentle color gradients, whimsical details, and a dreamy quality. Use soft pastels and muted tones with occasional pops of brighter colors for emphasis.'),
  ('bright_cartoon', 'Bright & Playful', 'Bold, vibrant cartoon style', 'Style: Bright, bold cartoon illustration with vibrant colors and clean lines. Characters should have expressive faces and friendly smiles. Use saturated, cheerful colors and dynamic compositions.'),
  ('storybook_classic', 'Classic Storybook', 'Traditional children''s book illustration', 'Style: Classic children''s book illustration reminiscent of golden age picture books. Use rich, warm colors, detailed backgrounds, expressive characters, and a timeless quality.'),
  ('paper_cutout', 'Paper Cutout', 'Layered paper craft aesthetic', 'Style: Paper cutout or collage illustration with layered textures and dimensional quality. Use bold, flat construction-paper colors, visible texture, torn edges, and original layered elements.'),
  ('soft_digital', 'Soft Digital', 'Gentle digital painting style', 'Style: Soft digital painting with smooth gradients and gentle lighting. Characters should have a cute, rounded appearance with soft edges and a cohesive pastel palette.'),
  ('crayon_charm', 'Crayon Charm', 'Child-like crayon drawing style', 'Style: Charming crayon or colored-pencil illustration with visible texture strokes and a hand-drawn quality. Use rich, waxy colors and visible paper texture.')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  prompt_modifier = EXCLUDED.prompt_modifier,
  is_active = true;

ALTER FUNCTION public.update_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Private account and story objects should not appear in the anonymous API.
REVOKE ALL ON public.profiles, public.children, public.stories, public.story_pages FROM anon;
REVOKE ALL ON public.themes, public.art_styles FROM anon;

-- Declare the app's authenticated API surface explicitly instead of relying on
-- project defaults. Row-level security below still limits every row by user.
REVOKE ALL ON public.profiles, public.children, public.stories, public.story_pages FROM authenticated;
REVOKE ALL ON public.themes, public.art_styles FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles, public.children TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories, public.story_pages TO authenticated;
GRANT SELECT ON public.themes, public.art_styles TO authenticated;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can manage own children" ON public.children;
CREATE POLICY "Users can manage own children" ON public.children
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own stories" ON public.stories;
CREATE POLICY "Users can manage own stories" ON public.stories
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage own story pages" ON public.story_pages;
CREATE POLICY "Users can manage own story pages" ON public.story_pages
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_pages.story_id
      AND stories.user_id = (SELECT auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stories
    WHERE stories.id = story_pages.story_id
      AND stories.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Anyone can view active themes" ON public.themes;
CREATE POLICY "Authenticated users can view active themes" ON public.themes
  FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active art styles" ON public.art_styles;
CREATE POLICY "Authenticated users can view active art styles" ON public.art_styles
  FOR SELECT TO authenticated USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_stories_theme_id ON public.stories(theme_id);
CREATE INDEX IF NOT EXISTS idx_stories_art_style_id ON public.stories(art_style_id);
