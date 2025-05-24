const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Define standard sizes for images
const sizes = {
  thumbnail: { width: 100, height: 100 },
  medium: { width: 300, height: 300 },
  dashboard: { width: 50, height: 50 }
};

/**
 * Process an uploaded image, creating multiple resized versions
 * @param {Object} file - The uploaded file object from express-fileupload
 * @returns {Promise<Object>} - Object containing original and resized image paths
 */
const processImage = async (file) => {
  try {
    // Generate a unique filename based on timestamp
    const timestamp = Date.now();
    const fileExt = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, fileExt).toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${baseName}-${timestamp}${fileExt}`;

    // Define paths
    const uploadsDir = path.join(__dirname, '../uploads');
    const thumbnailsDir = path.join(uploadsDir, 'thumbnails');
    
    // Create directories if they don't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    // Paths for different image sizes
    const originalPath = path.join(uploadsDir, fileName);
    const thumbnailPath = path.join(thumbnailsDir, fileName);
    
    // Save original file
    await file.mv(originalPath);
    
    // Create a thumbnail version
    await sharp(originalPath)
      .resize(sizes.thumbnail.width, sizes.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(thumbnailPath);
    
    // Create a dashboard version (50x50)
    const dashboardPath = path.join(thumbnailsDir, `dashboard-${fileName}`);
    await sharp(originalPath)
      .resize(sizes.dashboard.width, sizes.dashboard.height, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(dashboardPath);

    return {
      original: fileName,
      thumbnail: `thumbnails/${fileName}`,
      dashboard: `thumbnails/dashboard-${fileName}`
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

/**
 * Get array of allowed image mime types
 * @returns {Array} - Array of allowed mime types
 */
const getAllowedImageTypes = () => [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp', 
  'image/svg+xml',
  'image/bmp',
  'image/tiff'
];

/**
 * Check if file is a valid image
 * @param {Object} file - The uploaded file object
 * @returns {Boolean} - True if file is a valid image
 */
const isValidImage = (file) => {
  const allowedTypes = getAllowedImageTypes();
  return allowedTypes.includes(file.mimetype);
};

/**
 * Delete image files associated with a profile
 * @param {String} fileName - The base filename to delete
 */
const deleteProfileImages = async (fileName) => {
  if (!fileName) return;
  
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Paths to potentially delete
    const paths = [
      path.join(uploadsDir, fileName),
      path.join(uploadsDir, 'thumbnails', fileName),
      path.join(uploadsDir, 'thumbnails', `dashboard-${fileName}`)
    ];
    
    // Delete each file if it exists
    for (const filePath of paths) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Error deleting profile images:', error);
  }
};

module.exports = {
  processImage,
  isValidImage,
  getAllowedImageTypes,
  deleteProfileImages
}; 