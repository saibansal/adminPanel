/**
 * Converts an image file to WebP format with compression
 * @param {File} file - The original image file
 * @param {number} quality - Compression quality (0 to 1)
 * @returns {Promise<File>} - The converted WebP file
 */
export const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Only convert images
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    // Skip if already webp (unless we want to re-compress)
    if (file.type === 'image/webp') {
      // We could still process it to ensure compression, but usually not needed
      // resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob conversion failed'));
            return;
          }
          
          // Create a new file name with .webp extension
          const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const webpFile = new File([blob], fileName, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          resolve(webpFile);
        }, 'image/webp', quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
