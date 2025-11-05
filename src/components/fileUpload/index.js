import { Upload, Typography, Space } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

export const FileUpload = ({ onFileSelect, isConverting }) => {
  const handleChange = (info) => {
    const { fileList } = info;

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
    beforeUpload: () => false,
    onChange: handleChange,
    disabled: isConverting,
  };

  return (
    <Dragger
      {...draggerProps}
      style={{
        borderRadius: 12,
        padding: 48,
        transition: 'all 0.3s ease',
      }}
    >
      <Space direction="vertical" size={24} style={{ textAlign: 'center' }}>
        <CloudUploadOutlined style={{
          fontSize: 64,
          opacity: isConverting ? 0.5 : 1
        }} />
        <Space direction="vertical" size={8}>
          <Text style={{
            fontSize: 24,
            fontWeight: 600,
            opacity: isConverting ? 0.5 : 1
          }}>
            {isConverting ? 'Converting...' : 'Select or Drag Files'}
          </Text>
          <Text style={{
            fontSize: 16,
            opacity: isConverting ? 0.5 : 1
          }}>
            Support for multiple HEIC/HEIF images
          </Text>
        </Space>
      </Space>
    </Dragger>
  );
};