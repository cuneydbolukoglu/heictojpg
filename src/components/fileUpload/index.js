// components/fileUpload.js
import { Upload, Typography, Space } from "antd";
import { InboxOutlined, CloudUploadOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

export const FileUpload = ({ onFileSelect, isConverting, isDarkMode }) => {
  const handleChange = (info) => {
    const { fileList } = info;
    
    // Sadece son eklenen dosyaları al
    const newFiles = fileList
      .filter(file => file.originFileObj)
      .map(file => file.originFileObj);
    
    if (newFiles.length > 0) {
      onFileSelect(newFiles);
    }
  };

  const draggerProps = {
    multiple: true,
    accept: ".heic,.heif,image/heic,image/heif",
    showUploadList: false,
    beforeUpload: () => false, // Otomatik upload'ı engelle
    onChange: handleChange,
    disabled: isConverting,
  };

  return (
    <Dragger
      {...draggerProps}
      style={{
        background: isDarkMode ? '#1f1f1f' : '#fafafa',
        border: `2px dashed ${isDarkMode ? '#434343' : '#d9d9d9'}`,
        borderRadius: 12,
        padding: 48,
        transition: 'all 0.3s ease',
      }}
    >
      <Space direction="vertical" size={24} style={{ textAlign: 'center' }}>
        <CloudUploadOutlined style={{ 
          fontSize: 64, 
          color: isDarkMode ? '#1890ff' : '#1890ff',
          opacity: isConverting ? 0.5 : 1
        }} />
        
        <Space direction="vertical" size={8}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 600,
            color: isDarkMode ? '#fff' : '#000',
            opacity: isConverting ? 0.5 : 1
          }}>
            {isConverting ? 'Converting...' : 'Select or Drag Files'}
          </Text>
          <Text style={{ 
            fontSize: 16,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
            opacity: isConverting ? 0.5 : 1
          }}>
            Support for multiple HEIC/HEIF images
          </Text>
        </Space>
      </Space>
    </Dragger>
  );
};