// Category Service
// Handles all category-related operations with Firebase Realtime Database

import { database } from '../config/firebase';
import { ref, push, set, get, update, remove, query, orderByChild } from 'firebase/database';

/**
 * Category data model validation
 * @param {Object} categoryData - Category data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateCategoryData = (categoryData) => {
  const errors = [];
  
  // Required fields validation
  if (!categoryData.name || typeof categoryData.name !== 'string' || categoryData.name.trim().length === 0) {
    errors.push('Category name is required and must be a non-empty string');
  }
  
  if (!categoryData.slug || typeof categoryData.slug !== 'string' || categoryData.slug.trim().length === 0) {
    errors.push('Category slug is required and must be a non-empty string');
  }
  
  if (!categoryData.description || typeof categoryData.description !== 'string' || categoryData.description.trim().length === 0) {
    errors.push('Category description is required and must be a non-empty string');
  }
  
  // Slug format validation (URL-friendly)
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (categoryData.slug && !slugPattern.test(categoryData.slug)) {
    errors.push('Category slug must be URL-friendly (lowercase letters, numbers, and hyphens only)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate URL-friendly slug from category name
 * @param {string} name - Category name
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} - Created category with ID
 */
export const createCategory = async (categoryData) => {
  try {
    // Auto-generate slug if not provided
    if (!categoryData.slug && categoryData.name) {
      categoryData.slug = generateSlug(categoryData.name);
    }
    
    // Validate category data
    const validation = validateCategoryData(categoryData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Check if slug already exists
    const existingCategory = await getCategoryBySlug(categoryData.slug);
    if (existingCategory) {
      throw new Error('Category with this slug already exists');
    }
    
    const categoriesRef = ref(database, 'categories');
    const newCategoryRef = push(categoriesRef);
    
    const categoryWithMetadata = {
      ...categoryData,
      id: newCategoryRef.key,
      productCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await set(newCategoryRef, categoryWithMetadata);
    
    return categoryWithMetadata;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Get all categories
 * @returns {Promise<Array>} - Array of all categories
 */
export const getAllCategories = async () => {
  try {
    const categoriesRef = ref(database, 'categories');
    const snapshot = await get(categoriesRef);
    
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      return Object.keys(categoriesData).map(key => ({
        id: key,
        ...categoriesData[key]
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} - Category data or null if not found
 */
export const getCategoryById = async (categoryId) => {
  try {
    const categoryRef = ref(database, `categories/${categoryId}`);
    const snapshot = await get(categoryRef);
    
    if (snapshot.exists()) {
      return {
        id: categoryId,
        ...snapshot.val()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object|null>} - Category data or null if not found
 */
export const getCategoryBySlug = async (slug) => {
  try {
    const categoriesRef = ref(database, 'categories');
    const slugQuery = query(categoriesRef, orderByChild('slug'));
    const snapshot = await get(slugQuery);
    
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      const categoryEntry = Object.entries(categoriesData).find(([key, category]) => category.slug === slug);
      
      if (categoryEntry) {
        const [id, categoryData] = categoryEntry;
        return {
          id,
          ...categoryData
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    throw error;
  }
};

/**
 * Update category
 * @param {string} categoryId - Category ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated category data
 */
export const updateCategory = async (categoryId, updateData) => {
  try {
    // Get current category data
    const currentCategory = await getCategoryById(categoryId);
    if (!currentCategory) {
      throw new Error('Category not found');
    }
    
    // Auto-generate slug if name is being updated and slug is not provided
    if (updateData.name && !updateData.slug) {
      updateData.slug = generateSlug(updateData.name);
    }
    
    // Merge update data with current data
    const updatedCategoryData = {
      ...currentCategory,
      ...updateData,
      updatedAt: Date.now()
    };
    
    // Validate updated data
    const validation = validateCategoryData(updatedCategoryData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Check if slug already exists (excluding current category)
    if (updateData.slug && updateData.slug !== currentCategory.slug) {
      const existingCategory = await getCategoryBySlug(updateData.slug);
      if (existingCategory && existingCategory.id !== categoryId) {
        throw new Error('Category with this slug already exists');
      }
    }
    
    const categoryRef = ref(database, `categories/${categoryId}`);
    await update(categoryRef, updatedCategoryData);
    
    return updatedCategoryData;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete category
 * @param {string} categoryId - Category ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId) => {
  try {
    // Check if category has products
    const category = await getCategoryById(categoryId);
    if (category && category.productCount > 0) {
      throw new Error('Cannot delete category that contains products');
    }
    
    const categoryRef = ref(database, `categories/${categoryId}`);
    await remove(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Update category product count
 * @param {string} categorySlug - Category slug
 * @param {number} increment - Number to increment/decrement (can be negative)
 * @returns {Promise<void>}
 */
export const updateCategoryProductCount = async (categorySlug, increment) => {
  try {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) {
      throw new Error('Category not found');
    }
    
    const newCount = Math.max(0, (category.productCount || 0) + increment);
    
    const categoryRef = ref(database, `categories/${category.id}`);
    await update(categoryRef, {
      productCount: newCount,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating category product count:', error);
    throw error;
  }
};

/**
 * Get categories with product counts
 * @returns {Promise<Array>} - Array of categories with their product counts
 */
export const getCategoriesWithCounts = async () => {
  try {
    const categories = await getAllCategories();
    
    // Sort by product count (descending) and then by name
    return categories.sort((a, b) => {
      if (b.productCount !== a.productCount) {
        return b.productCount - a.productCount;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error fetching categories with counts:', error);
    throw error;
  }
};