// Storage Service
// Handles image upload and management with Firebase Storage

import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage';

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
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File must be a valid image (JPEG, PNG, or WebP)');
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
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
 * Upload single image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} folder - Storage folder (e.g., 'products', 'categories')
 * @param {Function} onProgress - Progress callback function (optional)
 * @returns {Promise<Object>} - Upload result with URL and metadata
 */
export const uploadImage = async (file, folder = 'products', onProgress = null) => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const storagePath = `${folder}/${filename}`;
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    const uploadTask = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    
    return {
      url: downloadURL,
      path: storagePath,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: Date.now()
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
 * Delete image from Firebase Storage
 * @param {string} imagePath - Storage path of the image
 * @returns {Promise<void>}
 */
export const deleteImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Delete multiple images
 * @param {Array} imagePaths - Array of storage paths
 * @returns {Promise<Array>} - Array of deletion results
 */
export const deleteMultipleImages = async (imagePaths) => {
  try {
    const deletePromises = imagePaths.map(async (path) => {
      try {
        await deleteImage(path);
        return { path, success: true };
      } catch (error) {
        return { path, success: false, error: error.message };
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
 * @param {string} folder - Storage folder
 * @returns {Promise<Array>} - Array of image metadata
 */
export const getImagesInFolder = async (folder) => {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    
    const imagePromises = result.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return {
        name: itemRef.name,
        path: itemRef.fullPath,
        url: url
      };
    });
    
    const images = await Promise.all(imagePromises);
    return images;
  } catch (error) {
    console.error('Error getting images in folder:', error);
    throw error;
  }
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
 * Extract storage path from Firebase Storage URL
 * @param {string} url - Firebase Storage download URL
 * @returns {string|null} - Storage path or null if invalid URL
 */
export const extractStoragePathFromURL = (url) => {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
    if (pathMatch) {
      return decodeURIComponent(pathMatch[1]);
    }
    return null;
  } catch (error) {
    console.error('Error extracting storage path from URL:', error);
    return null;
  }
};

/**
 * Get image metadata from URL
 * @param {string} url - Firebase Storage download URL
 * @returns {Promise<Object>} - Image metadata
 */
export const getImageMetadata = async (url) => {
  try {
    const path = extractStoragePathFromURL(url);
    if (!path) {
      throw new Error('Invalid Firebase Storage URL');
    }
    
    const imageRef = ref(storage, path);
    const metadata = await getMetadata(imageRef);
    
    return {
      name: metadata.name,
      path: path,
      size: metadata.size,
      type: metadata.contentType,
      created: metadata.timeCreated,
      updated: metadata.updated
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw error;
  }
};