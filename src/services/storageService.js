// Storage Service
// Handles image upload and management with Cloudinary

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateImageFile = (file) => {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File must be a valid image (JPEG, PNG, WebP, or GIF)');
  }
  
  // Check file size (max 10MB for Cloudinary free tier)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }
  
  // Check file name
  if (file.name.length > 100) {
    errors.push('File name must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate unique filename with timestamp
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
};

/**
 * Upload single image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder name for organization
 * @param {Function} onProgress - Progress callback function (optional)
 * @returns {Promise<Object>} - Upload result with URL and metadata
 */
export const uploadImage = async (file, folder = 'products', onProgress = null) => {
  try {
    // Check if Cloudinary is configured
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error(
        'Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.'
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Generate unique filename (without extension, Cloudinary handles it)
    const filename = generateUniqueFilename(file.name);
    const publicId = `${folder}/${filename.split('.')[0]}`;
    
    if (onProgress) onProgress(10);
    
    // Create form data for Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('public_id', publicId);
    formData.append('folder', folder);
    
    if (onProgress) onProgress(30);
    
    // Upload to Cloudinary using XMLHttpRequest for progress tracking
    const result = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(Math.min(90, 30 + progress * 0.6)); // Scale progress from 30-90%
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (onProgress) onProgress(100);
            resolve(response);
          } catch (e) {
            reject(new Error('Failed to parse Cloudinary response'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error?.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.ontimeout = () => reject(new Error('Upload timed out'));
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.timeout = 60000; // 60 second timeout
      xhr.send(formData);
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      path: result.public_id,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      width: result.width,
      height: result.height,
      format: result.format,
      uploadedAt: Date.now(),
      // Cloudinary transformations URLs
      thumbnail: result.secure_url.replace('/upload/', '/upload/c_thumb,w_150,h_150/'),
      medium: result.secure_url.replace('/upload/', '/upload/c_scale,w_400/')
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 * @param {FileList|Array} files - Array of image files
 * @param {string} folder - Storage folder
 * @param {Function} onProgress - Progress callback function (optional)
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleImages = async (files, folder = 'products', onProgress = null) => {
  try {
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map((file, index) => {
      return uploadImage(file, folder, (progress) => {
        if (onProgress) {
          onProgress(index, progress, fileArray.length);
        }
      });
    });
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * Note: Deletion requires signed requests which need backend support
 * For unsigned uploads, images cannot be deleted from client-side
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>}
 */
export const deleteImage = async (publicId) => {
  try {
    // Cloudinary unsigned uploads cannot be deleted from client-side
    // This would require a backend endpoint with signed requests
    console.warn(
      'Image deletion requires server-side implementation with Cloudinary API secret. Public ID:',
      publicId
    );
    return { 
      success: false, 
      message: 'Client-side deletion not supported. Implement server-side deletion endpoint.' 
    };
  } catch (error) {
    console.error('Error in delete operation:', error);
    throw error;
  }
};

/**
 * Delete multiple images
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Array>} - Array of deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(async (idOrObj) => {
      try {
        const publicId = typeof idOrObj === 'string' ? idOrObj : idOrObj.publicId || idOrObj.path;
        const result = await deleteImage(publicId);
        return { publicId, ...result };
      } catch (error) {
        return { publicId: idOrObj, success: false, error: error.message };
      }
    });
    
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw error;
  }
};

/**
 * Get all images in a folder
 * Note: This requires the Admin API which needs backend support
 * @param {string} folder - Folder name
 * @returns {Promise<Array>} - Empty array (requires backend implementation)
 */
export const getImagesInFolder = async (folder) => {
  console.warn(
    'Listing images requires Cloudinary Admin API (server-side). Folder:',
    folder
  );
  return [];
};

/**
 * Resize image on client side before upload (optional utility)
 * @param {File} file - Image file to resize
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<File>} - Resized image file
 */
export const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        },
        file.type,
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} - Public ID or null if invalid URL
 */
export const extractPublicIdFromURL = (url) => {
  try {
    // Cloudinary URLs look like: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{format}
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// Legacy function - kept for backwards compatibility
export const extractStoragePathFromURL = extractPublicIdFromURL;
export const extractImageIdFromURL = extractPublicIdFromURL;

/**
 * Get image metadata from URL
 * @param {string} url - Image URL
 * @returns {Promise<Object>} - Basic image metadata
 */
export const getImageMetadata = async (url) => {
  try {
    const publicId = extractPublicIdFromURL(url);
    
    return {
      url,
      publicId,
      // Generate transformation URLs
      thumbnail: url.replace('/upload/', '/upload/c_thumb,w_150,h_150/'),
      medium: url.replace('/upload/', '/upload/c_scale,w_400/'),
      large: url.replace('/upload/', '/upload/c_scale,w_800/')
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw error;
  }
};

/**
 * Generate Cloudinary transformation URL
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export const getTransformedUrl = (url, options = {}) => {
  const {
    width,
    height,
    crop = 'scale', // scale, fill, fit, thumb, crop
    quality = 'auto',
    format = 'auto'
  } = options;
  
  let transformation = `f_${format},q_${quality}`;
  
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;
  if (crop) transformation += `,c_${crop}`;
  
  return url.replace('/upload/', `/upload/${transformation}/`);
};