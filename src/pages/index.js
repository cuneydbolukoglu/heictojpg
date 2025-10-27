import { useState } from "react";
import { FileUpload } from "@/components/fileUpload";
import { ConversionStatus } from "@/components/conversionStatus";
import { message, Typography, Card, ConfigProvider, theme } from "antd";
import { FileImageOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const Index = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [files, setFiles] = useState([]);

  const handleFileSelect = async (selectedFiles) => {
    setIsConverting(true);
    
    const initialFiles = selectedFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      fileName: file.name,
      status: "converting",
    }));
    
    setFiles(initialFiles);

    // Convert all files in parallel
    const conversionPromises = selectedFiles.map(async (file, index) => {
      try {
        const heic2any = (await import("heic2any")).default;

        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });

        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        const url = URL.createObjectURL(blob);

        return {
          id: initialFiles[index].id,
          fileName: file.name,
          status: "success",
          downloadUrl: url,
        };
      } catch (error) {
        console.error("Conversion error:", error);
        return {
          id: initialFiles[index].id,
          fileName: file.name,
          status: "error",
          errorMessage: "Failed to convert this image",
        };
      }
    });

    const results = await Promise.all(conversionPromises);
    setFiles(results);
    setIsConverting(false);

    const successCount = results.filter(r => r.status === "success").length;
    const errorCount = results.filter(r => r.status === "error").length;

    if (successCount > 0) {
      message.success(
        `${successCount} görüntü başarıyla dönüştürüldü${errorCount > 0 ? `, ${errorCount} başarısız` : ''}`
      );
    } else {
      message.error("Tüm görüntüler dönüştürülemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleReset = () => {
    files.forEach(file => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    setFiles([]);
    setIsConverting(false);
  };

  const handleDownloadAll = () => {
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
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: 'hsl(239, 84%, 67%)',
          colorSuccess: 'hsl(142, 76%, 36%)',
          colorError: 'hsl(0, 84%, 60%)',
          colorBgContainer: 'hsl(0, 0%, 100%)',
          colorBorder: 'hsl(220, 15%, 88%)',
          borderRadius: 12,
          fontFamily: 'inherit',
        },
      }}
    >
      <div style={{ 
        minHeight: '100vh', 
        background: 'hsl(var(--background))' 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '48px 16px' 
        }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '48px' 
          }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px' 
            }}>
              <div style={{
                background: 'linear-gradient(135deg, hsl(239, 84%, 67%), hsl(243, 75%, 59%))',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)'
              }}>
                <FileImageOutlined style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <Title 
                level={1} 
                style={{ 
                  margin: 0, 
                  fontSize: '48px',
                  background: 'linear-gradient(135deg, hsl(239, 84%, 67%), hsl(243, 75%, 59%))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                HEIC to JPG
              </Title>
            </div>
            <Paragraph style={{ 
              fontSize: '20px', 
              color: 'hsl(215, 16%, 47%)', 
              maxWidth: '800px', 
              margin: '0 auto' 
            }}>
              HEIC görüntülerinizi anında JPG formatına dönüştürün. Hızlı, ücretsiz ve tamamen gizli.
            </Paragraph>
          </div>

          {/* Main Content */}
          <div style={{ 
            maxWidth: '896px', 
            margin: '0 auto' 
          }}>
            {files.length === 0 ? (
              <FileUpload onFileSelect={handleFileSelect} isConverting={isConverting} />
            ) : (
              <ConversionStatus
                files={files}
                onReset={handleReset}
                onDownloadAll={handleDownloadAll}
              />
            )}
          </div>

          {/* Features */}
          <div style={{ 
            marginTop: '80px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '32px', 
            maxWidth: '1000px', 
            margin: '80px auto 0' 
          }}>
            {[
              {
                title: "Hızlı Dönüştürme",
                description: "Optimize edilmiş algoritmamızla HEIC dosyalarınızı saniyeler içinde JPG'ye dönüştürün",
              },
              {
                title: "%100 Gizli",
                description: "Tüm dönüştürmeler tarayıcınızda gerçekleşir. Dosyalarınız cihazınızdan ayrılmaz",
              },
              {
                title: "Yüksek Kalite",
                description: "Gelişmiş dönüştürme sürecimizle mükemmel görüntü kalitesini koruyun",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                hoverable
                style={{
                  borderRadius: '12px',
                  border: '1px solid hsl(220, 15%, 88%)',
                  background: 'hsl(0, 0%, 100%)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
                bodyStyle={{
                  padding: '20px'
                }}
              >
                <Title level={4} style={{ 
                  color: 'hsl(222, 47%, 11%)',
                  marginBottom: '8px'
                }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ 
                  color: 'hsl(215, 16%, 47%)', 
                  fontSize: '14px',
                  margin: 0
                }}>
                  {feature.description}
                </Paragraph>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Index;