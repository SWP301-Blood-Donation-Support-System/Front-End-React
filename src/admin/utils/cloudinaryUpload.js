// Cloudinary upload utility
const CLOUDINARY_UPLOAD_PRESET = "dc0ypziou"; // Your cloud name from the URL
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_UPLOAD_PRESET}/upload`;

export const uploadImageToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // You might need to create an upload preset in Cloudinary
    
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      data: data
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Chỉ được phép upload file ảnh (JPG, PNG, GIF, WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Kích thước file không được vượt quá 5MB'
    };
  }

  return {
    valid: true,
    error: null
  };
};
