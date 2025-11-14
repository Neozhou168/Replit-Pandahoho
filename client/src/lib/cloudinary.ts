export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return url;
  
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  try {
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) return url;

    const transformations: string[] = [];
    
    if (width) {
      transformations.push(`w_${width}`);
    }
    
    transformations.push('c_limit');
    transformations.push('q_auto');
    transformations.push('f_auto');
    
    const transformationString = transformations.join(',');
    
    return `${urlParts[0]}/upload/${transformationString}/${urlParts[1]}`;
  } catch {
    return url;
  }
}
