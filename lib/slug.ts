/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Generate a unique slug by appending a random suffix if needed
 */
export function generateUniqueSlug(title: string, existingSlugs: string[] = []): string {
  const baseSlug = slugify(title);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Append random suffix
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${suffix}`;
}

