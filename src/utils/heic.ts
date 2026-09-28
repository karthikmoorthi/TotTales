export async function convertHeicToJpeg(
  _source: Blob,
  _quality: number
): Promise<Blob> {
  throw new Error('HEIC conversion is only available on web.');
}
