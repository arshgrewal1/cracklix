import data from '@/app/lib/placeholder-images.json';

/**
 * @fileOverview Institutional Image Registry.
 * FIXED: Canonical source pointed to src/app/lib/placeholder-images.json as per instructions.
 */

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export function getPlaceholderById(id: string): string {
  const img = PlaceHolderImages.find(p => p.id === id);
  return img ? img.imageUrl : "https://picsum.photos/seed/error/400/400";
}
