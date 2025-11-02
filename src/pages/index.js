import { useState, useEffect, useCallback } from "react";
import {
  message,
  Typography,
  Card,
  ConfigProvider,
  theme,
  Layout,
  Space,
  Flex,
  App,
  Modal
} from "antd";
import { FileImageOutlined, BulbOutlined, BulbFilled } from "@ant-design/icons";
import { FileUpload } from "@/components/fileUpload";
import { ConversionStatus } from "@/components/conversionStatus";

const { Title, Paragraph } = Typography;
const { Header, Content } = Layout;

const Home = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [files, setFiles] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [airdropModalVisible, setAirdropModalVisible] = useState(false);
  const [pendingAirdropFiles, setPendingAirdropFiles] = useState([]);

  // Sistem tema tercihini dinle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // AirDrop dosyalarını dinle - GÜVENLİ VERSİYON
  useEffect(() => {
    if (window.electronAPI) {
      const handleAirdropFileDetected = async (event, data) => {
        console.log('AirDrop file detected:', data);

        // Data kontrolü - güvenli erişim
        if (!data || !data.file || !data.file.name) {
          console.error('Invalid AirDrop data:', data);
          return;
        }

        // Yeni dosyayı pending list'e ekle
        setPendingAirdropFiles(prev => {
          const newFiles = [...prev, data.file];
          // Modal'ı göster
          setAirdropModalVisible(true);
          return newFiles;
        });
      };

      window.electronAPI.onAirdropFileDetected(handleAirdropFileDetected);

      return () => {
        if (window.electronAPI) {
          window.electronAPI.removeAllListeners('airdrop-file-detected');
        }
      };
    }
  }, []);

  const handleAirdropConvert = async () => {
    // Güvenlik kontrolü
    if (!pendingAirdropFiles || pendingAirdropFiles.length === 0) {
      setAirdropModalVisible(false);
      return;
    }

    setAirdropModalVisible(false);
    setIsConverting(true); // Conversion başladı

    try {
      const filesToConvert = [];

      console.log('🔄 Starting AirDrop conversion for files:', pendingAirdropFiles);

      // Her AirDrop dosyasını oku ve File objesine dönüştür
      for (const airdropFile of pendingAirdropFiles) {
        // Dosya validasyonu
        if (!airdropFile || !airdropFile.path || !airdropFile.name) {
          console.warn('⏭️ Skipping invalid AirDrop file:', airdropFile);
          continue;
        }

        try {
          console.log(`📥 Processing AirDrop file: ${airdropFile.name}`);

          const result = await window.electronAPI.readAirdropFile(airdropFile.path);

          if (result && result.success) {
            console.log(`✅ Successfully read: ${airdropFile.name}, buffer size:`, result.buffer.length);

            // Buffer'ı Blob'a dönüştür - HEIC MIME type ile
            const blob = new Blob([result.buffer], {
              type: airdropFile.name.toLowerCase().endsWith('.heic') ? 'image/heic' : 'image/heif'
            });

            // File objesi oluştur
            const file = new File([blob], airdropFile.name, {
              type: blob.type,
              lastModified: Date.now()
            });

            filesToConvert.push(file);
            console.log(`✅ Created File object for: ${airdropFile.name}`);
          } else {
            console.error(`❌ Failed to read AirDrop file: ${airdropFile.name}`, result?.error);
            message.error(`Failed to read: ${airdropFile.name}`);
          }
        } catch (fileError) {
          console.error(`❌ Error processing AirDrop file ${airdropFile.name}:`, fileError);
          message.error(`Error processing: ${airdropFile.name}`);
        }
      }

      console.log('📊 Total files ready for conversion:', filesToConvert.length);

      if (filesToConvert.length > 0) {
        await handleFileSelect(filesToConvert);
        message.success(`Processed ${filesToConvert.length} file(s) from AirDrop`);
      } else {
        message.warning('No valid files to convert from AirDrop');
        setIsConverting(false);
      }

    } catch (error) {
      console.error('❌ Error processing AirDrop files:', error);
      message.error('Failed to process AirDrop files');
      setIsConverting(false);
    } finally {
      // Pending listeyi temizle
      setPendingAirdropFiles([]);
      if (window.electronAPI) {
        await window.electronAPI.clearPendingAirdropFiles();
      }
    }
  };

  const handleAirdropCancel = async () => {
    setAirdropModalVisible(false);
    setPendingAirdropFiles([]);

    if (window.electronAPI) {
      await window.electronAPI.clearPendingAirdropFiles();
    }
  };

  const features = [
    {
      title: "Fast Conversion",
      description: "Convert your HEIC files to JPG in seconds with our optimized algorithm",
      icon: "⚡",
    },
    {
      title: "100% Confidential",
      description: "All conversions happen on your computer. Your files never leave your device",
      icon: "🔒",
    },
    {
      title: "High Quality",
      description: "Maintain excellent image quality with our advanced conversion process",
      icon: "🎯",
    },
  ];

  const handleFileSelect = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    console.log('🎯 Starting conversion for files:', selectedFiles.map(f => f.name));
    setIsConverting(true);

    const initialFiles = selectedFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      fileName: file.name,
      status: "converting",
      fileType: file.type,
      size: file.size
    }));

    setFiles(initialFiles);

    try {
      const conversionPromises = selectedFiles.map(async (file, index) => {
        console.log(`🔄 Converting: ${file.name}, type: ${file.type}, size: ${file.size}`);

        try {
          // heic2any kütüphanesini dynamic import et
          const heic2any = (await import("heic2any")).default;

          console.log(`⚡ Starting HEIC conversion for: ${file.name}`);

          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          });

          console.log(`✅ HEIC conversion successful for: ${file.name}`);

          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

          if (!blob) {
            throw new Error('Conversion resulted in empty blob');
          }

          const url = URL.createObjectURL(blob);
          console.log(`🔗 Created blob URL for: ${file.name}`, url);

          return {
            id: initialFiles[index].id,
            fileName: file.name,
            status: "success",
            downloadUrl: url,
            originalType: file.type,
            convertedType: 'image/jpeg'
          };
        } catch (error) {
          console.error(`❌ Conversion error for ${file.name}:`, error);
          return {
            id: initialFiles[index].id,
            fileName: file.name,
            status: "error",
            errorMessage: `Failed to convert: ${error.message}`,
          };
        }
      });

      const results = await Promise.all(conversionPromises);
      console.log('📋 All conversion results:', results);
      setFiles(results);

      const successCount = results.filter(r => r.status === "success").length;
      const errorCount = results.filter(r => r.status === "error").length;

      if (successCount > 0) {
        message.success(
          `Successfully converted ${successCount} image${successCount > 1 ? 's' : ''}${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        );
      } else {
        message.error("Failed to convert all images. Please try again.");
      }
    } catch (error) {
      console.error("💥 Overall conversion process failed:", error);
      message.error("Conversion process failed");
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = useCallback(() => {
    files.forEach(file => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    setFiles([]);
    setIsConverting(false);
  }, [files]);

  const handleDownloadAll = useCallback(() => {
    files.forEach(file => {
      if (file.status === "success" && file.downloadUrl) {
        const link = document.createElement("a");
        link.href = file.downloadUrl;
        link.download = file.fileName.replace(/\.(heic|heif)$/i, ".jpg");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }, [files]);

  // Modal için güvenli dosya isimleri
  const safeFileNames = pendingAirdropFiles
    .filter(file => file && file.name)
    .map(file => file.name);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <App>
        <Layout style={{
          minHeight: '100vh',
          background: isDarkMode ? '#141414' : '#f5f5f5'
        }}>
          <Content style={{
            padding: '48px 24px',
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%'
          }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <Title
                level={1}
                style={{
                  fontSize: '48px',
                  background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: 16
                }}
              >
                Convert HEIC to JPG
              </Title>
              <Paragraph style={{
                fontSize: '18px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
                maxWidth: '600px',
                margin: '0 auto 32px'
              }}>
                Instantly convert your HEIC images to JPG format. Fast, free, and completely private.
              </Paragraph>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              {files.length === 0 ? (
                <FileUpload
                  onFileSelect={handleFileSelect}
                  isConverting={isConverting}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <ConversionStatus
                  files={files}
                  onReset={handleReset}
                  onDownloadAll={handleDownloadAll}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>

            {/* Features Grid */}
            <div style={{
              marginTop: 80,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              maxWidth: 1000,
              margin: '80px auto 0'
            }}>
              {features.map((feature, index) => (
                <Card
                  key={index}
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                    background: isDarkMode ? '#1f1f1f' : '#fff',
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <div style={{ fontSize: 32 }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{
                      margin: 0,
                      color: isDarkMode ? '#fff' : '#000'
                    }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{
                      margin: 0,
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'
                    }}>
                      {feature.description}
                    </Paragraph>
                  </Space>
                </Card>
              ))}
            </div>
          </Content>
        </Layout>

        <Modal
          title="📥 AirDrop Files Detected"
          open={airdropModalVisible && safeFileNames.length > 0}
          onOk={handleAirdropConvert}
          onCancel={handleAirdropCancel}
          okText="Convert All"
          cancelText="Cancel"
          width={500}
        >
          <div style={{ margin: '20px 0' }}>
            <Paragraph>
              {safeFileNames.length === 1
                ? `Do you want to convert "${safeFileNames[0]}"?`
                : `Do you want to convert ${safeFileNames.length} files from AirDrop?`
              }
            </Paragraph>

            {safeFileNames.length > 1 && (
              <div style={{
                background: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                padding: '12px',
                borderRadius: '6px',
                marginTop: '12px'
              }}>
                <Paragraph strong style={{ marginBottom: '8px' }}>
                  Files:
                </Paragraph>
                {safeFileNames.map((fileName, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '4px',
                    padding: '4px 0'
                  }}>
                    <FileImageOutlined style={{ marginRight: '8px' }} />
                    <span>{fileName}</span>
                  </div>
                ))}
              </div>
            )}

            <Paragraph type="secondary" style={{ marginTop: '16px', fontSize: '12px' }}>
              Files are received via AirDrop and will be converted to JPG format.
            </Paragraph>
          </div>
        </Modal>
      </App>
    </ConfigProvider>
  );
};

export default Home;