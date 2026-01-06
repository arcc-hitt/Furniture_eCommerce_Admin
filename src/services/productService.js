// Product Service
// Handles all product-related CRUD operations with Firebase Realtime Database

import { database } from '../config/firebase';
import { ref, push, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';

/**
 * Product data model validation
 * @param {Object} productData - Product data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateProductData = (productData) => {
  const errors = [];
  
  // Required fields validation
  if (!productData.name || typeof productData.name !== 'string' || productData.name.trim().length === 0) {
    errors.push('Product name is required and must be a non-empty string');
  }
  
  if (!productData.description || typeof productData.description !== 'string' || productData.description.trim().length === 0) {
    errors.push('Product description is required and must be a non-empty string');
  }
  
  if (!productData.price || typeof productData.price !== 'number' || productData.price <= 0) {
    errors.push('Product price is required and must be a positive number');
  }
  
  if (!productData.category || typeof productData.category !== 'string' || productData.category.trim().length === 0) {
    errors.push('Product category is required and must be a non-empty string');
  }
  
  if (!productData.quantity || typeof productData.quantity !== 'number' || productData.quantity < 0) {
    errors.push('Product quantity is required and must be a non-negative number');
  }
  
  // Images validation - at least one image is required
  if (!productData.images || typeof productData.images !== 'object' || Object.keys(productData.images).length === 0) {
    errors.push('At least one product image is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product with ID
 */
export const createProduct = async (productData) => {
  try {
    // Validate product data
    const validation = validateProductData(productData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const productsRef = ref(database, 'products');
    const newProductRef = push(productsRef);
    
    const productWithMetadata = {
      ...productData,
      id: newProductRef.key,
      inStock: productData.quantity > 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await set(newProductRef, productWithMetadata);
    
    return productWithMetadata;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Get all products
 * @returns {Promise<Array>} - Array of all products
 */
export const getAllProducts = async () => {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);
    
    if (snapshot.exists()) {
      const productsData = snapshot.val();
      return Object.keys(productsData).map(key => ({
        id: key,
        ...productsData[key]
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object|null>} - Product data or null if not found
 */
export const getProductById = async (productId) => {
  try {
    const productRef = ref(database, `products/${productId}`);
    const snapshot = await get(productRef);
    
    if (snapshot.exists()) {
      return {
        id: productId,
        ...snapshot.val()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} - Array of products in the category
 */
export const getProductsByCategory = async (category) => {
  try {
    const productsRef = ref(database, 'products');
    const categoryQuery = query(productsRef, orderByChild('category'), equalTo(category));
    const snapshot = await get(categoryQuery);
    
    if (snapshot.exists()) {
      const productsData = snapshot.val();
      return Object.keys(productsData).map(key => ({
        id: key,
        ...productsData[key]
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

/**
 * Update product
 * @param {string} productId - Product ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated product data
 */
export const updateProduct = async (productId, updateData) => {
  try {
    // Get current product data
    const currentProduct = await getProductById(productId);
    if (!currentProduct) {
      throw new Error('Product not found');
    }
    
    // Merge update data with current data
    const updatedProductData = {
      ...currentProduct,
      ...updateData,
      updatedAt: Date.now()
    };
    
    // Validate updated data
    const validation = validateProductData(updatedProductData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Update inStock status based on quantity
    updatedProductData.inStock = updatedProductData.quantity > 0;
    
    const productRef = ref(database, `products/${productId}`);
    await update(productRef, updatedProductData);
    
    return updatedProductData;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Update product quantity
 * @param {string} productId - Product ID
 * @param {number} newQuantity - New quantity value
 * @returns {Promise<Object>} - Updated product data
 */
export const updateProductQuantity = async (productId, newQuantity) => {
  try {
    if (typeof newQuantity !== 'number' || newQuantity < 0) {
      throw new Error('Quantity must be a non-negative number');
    }
    
    const updateData = {
      quantity: newQuantity,
      inStock: newQuantity > 0,
      updatedAt: Date.now()
    };
    
    const productRef = ref(database, `products/${productId}`);
    await update(productRef, updateData);
    
    // Return updated product
    return await getProductById(productId);
  } catch (error) {
    console.error('Error updating product quantity:', error);
    throw error;
  }
};

/**
 * Delete product
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId) => {
  try {
    const productRef = ref(database, `products/${productId}`);
    await remove(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Search products by name or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} - Array of matching products
 */
export const searchProducts = async (searchTerm) => {
  try {
    const allProducts = await getAllProducts();
    const searchTermLower = searchTerm.toLowerCase();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTermLower) ||
      product.description.toLowerCase().includes(searchTermLower) ||
      product.category.toLowerCase().includes(searchTermLower)
    );
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};