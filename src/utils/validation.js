// Data Validation Utilities
// Common validation functions for the application

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Validate pincode format (Indian format)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} - True if valid pincode format
 */
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate price value
 * @param {number} price - Price to validate
 * @returns {Object} - Validation result
 */
export const validatePrice = (price) => {
  const errors = [];
  
  if (typeof price !== 'number') {
    errors.push('Price must be a number');
  } else if (price <= 0) {
    errors.push('Price must be greater than 0');
  } else if (price > 10000000) {
    errors.push('Price cannot exceed 1 crore');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate quantity value
 * @param {number} quantity - Quantity to validate
 * @returns {Object} - Validation result
 */
export const validateQuantity = (quantity) => {
  const errors = [];
  
  if (typeof quantity !== 'number') {
    errors.push('Quantity must be a number');
  } else if (quantity < 0) {
    errors.push('Quantity cannot be negative');
  } else if (!Number.isInteger(quantity)) {
    errors.push('Quantity must be a whole number');
  } else if (quantity > 100000) {
    errors.push('Quantity cannot exceed 100,000');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate product name
 * @param {string} name - Product name to validate
 * @returns {Object} - Validation result
 */
export const validateProductName = (name) => {
  const errors = [];
  
  if (!name || typeof name !== 'string') {
    errors.push('Product name is required');
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      errors.push('Product name cannot be empty');
    } else if (trimmedName.length < 3) {
      errors.push('Product name must be at least 3 characters long');
    } else if (trimmedName.length > 100) {
      errors.push('Product name cannot exceed 100 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate product description
 * @param {string} description - Product description to validate
 * @returns {Object} - Validation result
 */
export const validateProductDescription = (description) => {
  const errors = [];
  
  if (!description || typeof description !== 'string') {
    errors.push('Product description is required');
  } else {
    const trimmedDescription = description.trim();
    if (trimmedDescription.length === 0) {
      errors.push('Product description cannot be empty');
    } else if (trimmedDescription.length < 10) {
      errors.push('Product description must be at least 10 characters long');
    } else if (trimmedDescription.length > 1000) {
      errors.push('Product description cannot exceed 1000 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate category name
 * @param {string} category - Category name to validate
 * @returns {Object} - Validation result
 */
export const validateCategoryName = (category) => {
  const errors = [];
  
  if (!category || typeof category !== 'string') {
    errors.push('Category is required');
  } else {
    const trimmedCategory = category.trim();
    if (trimmedCategory.length === 0) {
      errors.push('Category cannot be empty');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate address data
 * @param {Object} address - Address object to validate
 * @returns {Object} - Validation result
 */
export const validateAddress = (address) => {
  const errors = [];
  
  if (!address || typeof address !== 'object') {
    errors.push('Address data is required');
    return { isValid: false, errors };
  }
  
  // Name validation
  if (!address.name || typeof address.name !== 'string' || address.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (address.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  // Phone validation
  if (!address.phone || typeof address.phone !== 'string') {
    errors.push('Phone number is required');
  } else if (!isValidPhone(address.phone)) {
    errors.push('Please enter a valid 10-digit phone number');
  }
  
  // Address validation
  if (!address.address || typeof address.address !== 'string' || address.address.trim().length === 0) {
    errors.push('Address is required');
  } else if (address.address.trim().length < 10) {
    errors.push('Address must be at least 10 characters long');
  }
  
  // City validation
  if (!address.city || typeof address.city !== 'string' || address.city.trim().length === 0) {
    errors.push('City is required');
  }
  
  // State validation
  if (!address.state || typeof address.state !== 'string' || address.state.trim().length === 0) {
    errors.push('State is required');
  }
  
  // Pincode validation
  if (!address.pincode || typeof address.pincode !== 'string') {
    errors.push('Pincode is required');
  } else if (!isValidPincode(address.pincode)) {
    errors.push('Please enter a valid 6-digit pincode');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input (remove harmful characters)
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate and sanitize form data
 * @param {Object} formData - Form data to validate and sanitize
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result with sanitized data
 */
export const validateAndSanitizeFormData = (formData, requiredFields = []) => {
  const errors = [];
  const sanitizedData = {};
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim().length === 0)) {
      errors.push(`${field} is required`);
    }
  });
  
  // Sanitize string fields
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'string') {
      sanitizedData[key] = sanitizeString(formData[key]);
    } else {
      sanitizedData[key] = formData[key];
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxNameLength = 100
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }
  
  // Check file name length
  if (file.name.length > maxNameLength) {
    errors.push(`File name exceeds ${maxNameLength} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};