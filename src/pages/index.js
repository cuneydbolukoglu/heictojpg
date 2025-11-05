import { useState, useCallback } from "react";
import {
  message,
  Typography,
  Card,
  Space,
  FloatButton
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { FileUpload } from "@/components/fileUpload";
import { ConversionStatus } from "@/components/conversionStatus";
import { AirDropModal } from "@/components/airdropModal";

const { Title, Paragraph } = Typography;

const Home = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [files, setFiles] = useState([]);
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

  const handleAirdropFiles = (airdropFiles) => {
    handleFileSelect(airdropFiles);
  };

  return (
    <>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {files.length === 0 ? (
          <FileUpload
            onFileSelect={handleFileSelect}
            isConverting={isConverting}
          />
        ) : (
          <ConversionStatus
            files={files}
            onReset={handleReset}
            onDownloadAll={handleDownloadAll}
          />
        )}
      </div>

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
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div style={{ fontSize: 32 }}>
                {feature.icon}
              </div>
              <Title level={4} style={{ margin: 0 }}>
                {feature.title}
              </Title>
              <Paragraph style={{ margin: 0 }}>
                {feature.description}
              </Paragraph>
            </Space>
          </Card>
        ))}
      </div>
      <AirDropModal onFilesConvert={handleAirdropFiles} />

      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="default"
        style={{ insetInlineEnd: 10 }}
      />
    </>
  );
};

export default Home;