-- Create storage bucket for preview images (themes and art styles)
INSERT INTO storage.buckets (id, name, public)
VALUES ('preview-images', 'preview-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to preview images
CREATE POLICY "Public can view preview images"
ON storage.objects FOR SELECT
USING (bucket_id = 'preview-images');

-- Allow authenticated users to upload preview images (for admin scripts)
CREATE POLICY "Authenticated users can upload preview images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'preview-images'
  AND auth.role() = 'authenticated'
);

-- Allow service role to manage preview images
CREATE POLICY "Service role can manage preview images"
ON storage.objects FOR ALL
USING (bucket_id = 'preview-images')
WITH CHECK (bucket_id = 'preview-images');
