// components/conversionStatus.js
import { List, Button, Flex, Space, Typography, Progress, Image } from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  LoadingOutlined, 
  DownloadOutlined,
  ReloadOutlined,
  FileImageOutlined
} from "@ant-design/icons";

const { Text } = Typography;

export const ConversionStatus = ({ files, onReset, onDownloadAll, isDarkMode }) => {
  const handleDownload = (file) => {
    if (file.downloadUrl) {
      const link = document.createElement("a");
      link.href = file.downloadUrl;
      link.download = file.fileName.replace(/\.(heic|heif)$/i, ".jpg");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const allComplete = files.every(f => f.status !== "converting");
  const hasSuccess = files.some(f => f.status === "success");
  const successCount = files.filter(f => f.status === "success").length;
  const totalCount = files.length;
  const convertingCount = files.filter(f => f.status === "converting").length;

  return (
    <div style={{
      background: isDarkMode ? '#1f1f1f' : '#fff',
      borderRadius: 12,
      padding: 32,
      border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={8}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 600,
            color: isDarkMode ? '#fff' : '#000'
          }}>
            {convertingCount > 0 
              ? `Converting ${convertingCount} of ${totalCount} files...` 
              : successCount === totalCount 
                ? "All conversions completed!" 
                : "Conversion Results"
            }
          </Text>
          {!allComplete && (
            <Progress 
              percent={Math.round((successCount / totalCount) * 100)} 
              size="small" 
              style={{ width: 200 }}
            />
          )}
        </Space>
        
        {allComplete && (
          <Space>
            {hasSuccess && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={onDownloadAll}
                size="large"
              >
                Download All ({successCount})
              </Button>
            )}
            <Button 
              onClick={onReset}
              icon={<ReloadOutlined />}
              size="large"
            >
              Convert More
            </Button>
          </Space>
        )}
      </Flex>

      {/* File List */}
      <List
        dataSource={files}
        renderItem={(file) => (
          <List.Item
            style={{
              background: isDarkMode ? '#2a2a2a' : '#fafafa',
              padding: '16px',
              borderRadius: 8,
              marginBottom: 8,
              border: `1px solid ${isDarkMode ? '#434343' : '#e8e8e8'}`,
              opacity: file.status === "converting" ? 0.7 : 1
            }}
            actions={file.status === "success" ? [
              <Button
                key="download"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(file)}
                size="middle"
              >
                Download
              </Button>
            ] : file.status === "error" ? [
              <Button
                key="retry"
                type="default"
                onClick={() => {/* Retry logic here */}}
                size="middle"
              >
                Retry
              </Button>
            ] : []}
          >
            <List.Item.Meta
              avatar={
                file.status === "converting" ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
                    <LoadingOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  </div>
                ) : file.status === "success" ? (
                  <div style={{ width: 50, height: 50, borderRadius: 6, overflow: 'hidden' }}>
                    <Image
                      width={50}
                      height={50}
                      src={file.downloadUrl}
                      alt={file.fileName}
                      style={{ 
                        objectFit: 'cover',
                        borderRadius: 6
                      }}
                      placeholder={
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: isDarkMode ? '#333' : '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 6
                        }}>
                          <FileImageOutlined style={{ color: isDarkMode ? '#666' : '#999' }} />
                        </div>
                      }
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{ 
                      display: 'none',
                      width: '100%', 
                      height: '100%', 
                      background: isDarkMode ? '#333' : '#f0f0f0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6
                    }}>
                      <FileImageOutlined style={{ color: isDarkMode ? '#666' : '#999' }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
                    <CloseCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                  </div>
                )
              }
              title={
                <Text style={{ 
                  color: isDarkMode ? '#fff' : '#000',
                  fontWeight: 500,
                  fontSize: 14
                }}>
                  {file.fileName}
                </Text>
              }
              description={
                <Text style={{
                  color: file.status === "success" ? '#52c41a' : 
                         file.status === "error" ? '#ff4d4f' : 
                         isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
                  fontSize: 12
                }}>
                  {file.status === "converting" ? "Converting to JPG..." :
                   file.status === "success" ? "Successfully converted - Ready to download" :
                   file.errorMessage || "Conversion failed"}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};