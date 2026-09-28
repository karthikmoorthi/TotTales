import heic2any from 'heic2any';

export async function convertHeicToJpeg(
  source: Blob,
  quality: number
): Promise<Blob> {
  const converted = await heic2any({
    blob: source,
    toType: 'image/jpeg',
    quality,
  });

  return Array.isArray(converted) ? converted[0] : converted;
}
