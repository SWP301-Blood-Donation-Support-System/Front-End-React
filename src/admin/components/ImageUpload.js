import React, { useState } from 'react';
import { Upload, Button, message, Progress, Image } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { uploadImageToCloudinary, validateImageFile } from '../utils/cloudinaryUpload';

const ImageUpload = ({ 
  value, 
  onChange, 
  placeholder = "Click để upload ảnh", 
  showPreview = true,
  maxWidth = 200,
  maxHeight = 200 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (file) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      message.error(validation.error);
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadImageToCloudinary(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        // Remove duplicate message since parent component will handle it
        // message.success('Upload ảnh thành công!');
        onChange && onChange(result.url);
      } else {
        message.error(`Upload thất bại: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }

    return false; // Prevent default upload behavior
  };

  const handleRemove = () => {
    onChange && onChange('');
    // Remove the duplicate message since parent component will handle it
    // message.success('Đã xóa ảnh');
  };

  const uploadProps = {
    beforeUpload: handleUpload,
    showUploadList: false,
    accept: 'image/*',
  };

  return (
    <div className="image-upload-container">
      {value ? (
        <div className="uploaded-image-preview">
          {showPreview && (
            <div className="image-preview-wrapper" style={{ maxWidth, maxHeight }}>
              <Image
                src={value}
                alt="Uploaded"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                preview={{
                  mask: (
                    <div style={{ color: 'white', fontSize: '14px' }}>
                      <EyeOutlined style={{ marginRight: 8 }} />
                      Xem ảnh
                    </div>
                  ),
                }}
              />
            </div>
          )}
          
          <div className="image-actions" style={{ marginTop: 8 }}>
            <Button 
              type="primary" 
              danger 
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              disabled={uploading}
            >
              Xóa ảnh
            </Button>
            
            <Upload {...uploadProps}>
              <Button 
                size="small"
                icon={<UploadOutlined />}
                disabled={uploading}
                style={{ marginLeft: 8 }}
              >
                Thay đổi
              </Button>
            </Upload>
          </div>
        </div>
      ) : (
        <div className="upload-area">
          <Upload {...uploadProps}>
            <Button 
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={uploading}
              size="large"
              style={{ 
                width: '100%',
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                background: '#fafafa'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                  {uploading ? 'Đang upload...' : placeholder}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Hỗ trợ: JPG, PNG, GIF, WebP (Max: 5MB)
                </div>
              </div>
            </Button>
          </Upload>
        </div>
      )}

      {uploading && uploadProgress > 0 && (
        <Progress 
          percent={uploadProgress} 
          size="small"
          style={{ marginTop: 8 }}
          status={uploadProgress === 100 ? "success" : "active"}
        />
      )}
    </div>
  );
};

export default ImageUpload;
