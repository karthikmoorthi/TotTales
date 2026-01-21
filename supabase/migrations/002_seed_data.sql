-- Seed data for themes and art styles
-- Run this after the initial schema migration

-- ============================================
-- THEMES
-- ============================================
INSERT INTO themes (name, display_name, description, base_prompt) VALUES
(
  'space_adventure',
  'Space Adventure',
  'Blast off to the stars and explore the galaxy!',
  'Create a story where the child is an astronaut exploring outer space. They should visit different planets, meet friendly aliens, and discover cosmic wonders. The story should be full of wonder and excitement about space exploration. Include elements like rockets, stars, moons, and colorful planets.'
),
(
  'underwater_explorer',
  'Underwater Explorer',
  'Dive deep into the ocean and meet sea creatures!',
  'Create a story where the child is an underwater explorer with special diving gear. They should meet friendly sea creatures like dolphins, colorful fish, and gentle whales. The story should explore coral reefs, underwater caves, and discover a treasure chest. The ocean should feel magical and full of wonders.'
),
(
  'enchanted_forest',
  'Enchanted Forest',
  'Discover magic in a mystical woodland!',
  'Create a story where the child discovers a magical forest. They should meet talking animals, helpful fairies, and find enchanted objects. The story should include a gentle quest like helping a lost baby animal find its way home. The forest should feel warm, safe, and full of wonder.'
),
(
  'dinosaur_land',
  'Dinosaur Land',
  'Travel back in time to meet friendly dinosaurs!',
  'Create a story where the child travels back in time to meet friendly dinosaurs. They should make friends with a baby dinosaur and go on an adventure together. Include different types of dinosaurs (T-Rex, Triceratops, Brachiosaurus) but make them friendly and playful. The prehistoric world should feel exciting but safe.'
),
(
  'superhero_academy',
  'Superhero Academy',
  'Discover your superpowers and save the day!',
  'Create a story where the child discovers they have a special superpower and joins a superhero academy. They should learn to use their powers for good and help solve a problem in their community (like rescuing a cat from a tree or helping clean up a park). The story should emphasize kindness, bravery, and helping others.'
),
(
  'fairy_tale_kingdom',
  'Fairy Tale Kingdom',
  'Become royalty in a magical kingdom!',
  'Create a story where the child is a prince or princess in a magical kingdom. They should go on a quest to help their kingdom, meet magical creatures, and show kindness to everyone they meet. The story should have a happy ending where their kindness is rewarded. Include castles, magical gardens, and friendly magical beings.'
),
(
  'safari_adventure',
  'Safari Adventure',
  'Go on a wild journey through the savanna!',
  'Create a story where the child goes on a safari adventure in Africa. They should meet different animals like lions, elephants, giraffes, and zebras. The child should help an animal in need, like reuniting a baby elephant with its herd. The savanna should feel vast, sunny, and full of wildlife.'
),
(
  'arctic_expedition',
  'Arctic Expedition',
  'Explore the frozen north and meet polar animals!',
  'Create a story where the child is an arctic explorer discovering the frozen north. They should meet polar bears, penguins, seals, and arctic foxes. The child might help build an igloo or watch the northern lights. The arctic should feel magical with snow, ice, and aurora borealis.'
);

-- ============================================
-- ART STYLES
-- ============================================
INSERT INTO art_styles (name, display_name, description, prompt_modifier) VALUES
(
  'watercolor_whimsy',
  'Watercolor Whimsy',
  'Soft, dreamy watercolor illustrations',
  'Style: Soft watercolor illustration with gentle color gradients, whimsical details, and a dreamy quality. The colors should blend softly like traditional watercolor paintings. Think of classic children''s book illustrations with a gentle, nostalgic feel. Use soft pastels and muted tones with occasional pops of brighter colors for emphasis.'
),
(
  'bright_cartoon',
  'Bright & Playful',
  'Bold, vibrant cartoon style',
  'Style: Bright, bold cartoon illustration with vibrant colors and clean lines. Characters should have expressive faces with big eyes and friendly smiles. The style should be energetic and playful, similar to modern animated children''s shows. Use saturated, cheerful colors and dynamic compositions.'
),
(
  'storybook_classic',
  'Classic Storybook',
  'Traditional children''s book illustration',
  'Style: Classic children''s book illustration reminiscent of golden age picture books. Rich, warm colors with detailed backgrounds and expressive characters. Think of the style of beloved classics with a timeless quality. Use earthy tones mixed with bright accents, and include fine details in textures and patterns.'
),
(
  'paper_cutout',
  'Paper Cutout',
  'Layered paper craft aesthetic',
  'Style: Paper cutout or collage style illustration with layered textures and dimensional quality. Colors should be bold and flat, like construction paper. The style should have visible texture like real paper crafts. Think of Eric Carle''s illustration style with torn paper edges and layered elements.'
),
(
  'soft_digital',
  'Soft Digital',
  'Gentle digital painting style',
  'Style: Soft digital painting with smooth gradients and gentle lighting. A modern, polished look that''s gentle on the eyes. Characters should have a cute, rounded appearance with soft edges. Use a cohesive, harmonious color palette with gentle pastel backgrounds and slightly more saturated foreground elements.'
),
(
  'crayon_charm',
  'Crayon Charm',
  'Child-like crayon drawing style',
  'Style: Charming crayon or colored pencil style illustration that looks like it was drawn with love. Visible texture strokes and a hand-drawn quality. The style should feel warm and childlike while still being beautifully composed. Use rich, waxy colors typical of quality crayons with visible paper texture.'
);
