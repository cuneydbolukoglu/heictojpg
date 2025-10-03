import React, { useMemo, useRef, useState } from "react";
import {  Typography, Upload, Button, Row, Col, Card, Space, message, Image, Progress } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faPlay, faImage, faFileImage, faDownload } from "@fortawesome/free-solid-svg-icons";
import GlobalLayout from "../../components/layout";
import { convertImage } from "../../utils/imageConverter";

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function ConverterCenter() {
  const [items, setItems] = useState([]);
  const inputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const addFiles = (fileList) => {
    const newOnes = Array.from(fileList).map((file) => {
      const isHeic = /\.(heic|heif)$/i.test(file.name);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        file,
        origUrl: isHeic ? null : URL.createObjectURL(file), // HEIC dosyaları için URL oluşturma
        convUrl: null,
        status: "idle",
        progress: 0,
        isHeic: isHeic, // HEIC dosyası mı diye işaretle
      };
    });
    setItems((prev) => [...prev, ...newOnes]);
  };

  const draggerProps = {
    multiple: true,
    accept: ".heic,.HEIC,.heif,.HEIF,.png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.webp,.WEBP",
    beforeUpload: (file) => {
      addFiles([file]);
      const isHeic = /\.(heic|heif)$/i.test(file.name);
      message.success(`${file.name} ${isHeic ? 'added (ready to convert)' : 'added'}`);
      return Upload.LIST_IGNORE;
    },
    showUploadList: false,
  };

  const setStatus = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const callConvertApi = async (file, onBump) => {
    // Küçük "sahte" ilerleme darbeleri
    for (const p of [35, 60, 85]) {
      await new Promise((r) => setTimeout(r, 120));
      onBump?.(p);
    }
    
    // Client-side conversion kullan
    const result = await convertImage(file);
    return result.dataUrl;
  };

  const convertOne = async (id) => {
    const item = items.find((x) => x.id === id);
    if (!item || item.status === "converting") return;

    setStatus(id, { status: "converting", progress: 10 });
    try {
      const url = await callConvertApi(item.file, (p) => setStatus(id, { progress: p }));
      setStatus(id, { convUrl: url, status: "done", progress: 100 });
      message.success(`${item.name} dönüştürüldü`);
    } catch (e) {
      console.error(e);
      setStatus(id, { status: "error", progress: 0 });
      message.error(`${item?.name ?? "Dosya"} dönüştürülemedi`);
    }
  };

  const previews = useMemo(
    () =>
      items.map((f) => (
        <Col xs={12} sm={8} md={6} key={f.id}>
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#0e1722",
              height: 200,
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {f.convUrl ? (
              // Dönüştürülmüş resim varsa göster
              <Image
                src={f.convUrl}
                alt={f.name}
                preview={{ mask: "Önizle" }}
                style={{
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  opacity: f.status === "converting" ? 0.6 : 1, 
                  transition: "opacity .2s",
                }}
              />
            ) : f.origUrl ? (
              // Orijinal resim varsa göster
              <Image
                src={f.origUrl}
                alt={f.name}
                preview={{ mask: "Önizle" }}
                style={{
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover",
                  opacity: f.status === "converting" ? 0.6 : 1, 
                  transition: "opacity .2s",
                }}
              />
            ) : (
              // HEIC dosyası için icon göster
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4dabff",
                  height: "100%",
                }}
              >
                <FontAwesomeIcon 
                  icon={f.isHeic ? faFileImage : faImage} 
                  style={{ fontSize: 48, marginBottom: 8, opacity: 0.8 }} 
                />
                <Text style={{ color: "#aab8c2", fontSize: 12, textAlign: "center" }}>
                  {f.isHeic ? "HEIC File" : "Image File"}
                </Text>
              </div>
            )}

            {/* Converting Progress Overlay */}
            {f.status === "converting" && (
              <div
                style={{
                  position: "absolute", 
                  inset: 0, 
                  display: "flex",
                  alignItems: "center", 
                  justifyContent: "center",
                  backdropFilter: "blur(1px)",
                  background: "rgba(0,0,0,0.5)",
                }}
              >
                <Progress type="circle" percent={f.progress} size={64} strokeColor="#4dabff" />
              </div>
            )}

            {/* Bottom Overlay - Sadece dönüştürülmüş dosyalar için */}
            {f.convUrl && f.status === "done" && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Sol taraf - Dosya adı ve indirme ikonu */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  <Text 
                    style={{ 
                      color: "#fff", 
                      fontSize: 12, 
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1
                    }}
                  >
                    {f.name.replace(/\.(heic|heif)$/i, ".jpg")}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<FontAwesomeIcon icon={faDownload} style={{ color: "#4dabff" }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const a = document.createElement("a");
                      a.href = f.convUrl;
                      a.download = f.name.replace(/\.(heic|heif)$/i, ".jpg");
                      a.click();
                    }}
                    style={{ 
                      padding: "4px 8px",
                      height: "auto",
                      minWidth: "auto"
                    }}
                  />
                </div>

                {/* Sağ taraf - Dosya boyutu */}
                <Text 
                  style={{ 
                    color: "#aab8c2", 
                    fontSize: 11,
                    fontWeight: 500,
                    marginLeft: 8
                  }}
                >
                  {formatFileSize(f.file?.size || 0)}
                </Text>
              </div>
            )}

            {/* Convert Button - Sadece dönüştürülmemiş dosyalar için */}
            {!f.convUrl && f.status !== "converting" && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                }}
              >
                <Button
                  type="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    convertOne(f.id);
                  }}
                  style={{
                    background: "#4dabff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
                >
                  Convert
                </Button>
              </div>
            )}
          </div>
        </Col>
      )),
    [items, formatFileSize]
  );

  return (
    <GlobalLayout conversionData={{ items, convertAll: () => convertAll(3) }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Title level={1} style={{ margin: 0, fontSize: 48, lineHeight: 1.1 }}>
          Convert HEIC to JPG
        </Title>
        <Text style={{ opacity: 0.8, fontSize: 18 }}>
          Drag and drop your HEIC files, or browse to upload. We&apos;ll convert them to JPG.
        </Text>
      </div>

      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Dragger
          {...draggerProps}
          style={{
            background: "#0f1923",
            borderRadius: 20,
            border: "2px dashed rgba(255,255,255,0.14)",
            height: 250,
          }}
        >
          <Space direction="vertical" align="center" style={{ width: "100%", height: 200, justifyContent: "center" }}>
            <FontAwesomeIcon icon={faCloudArrowUp} style={{ fontSize: 42, opacity: 0.9 }} />
            <Title level={4} style={{ margin: 0 }}>Drag and drop files here</Title>
            <Text style={{ opacity: 0.75 }}>Max 200 photos</Text>
          </Space>
        </Dragger>

        <div>
          <Title level={3} style={{ marginBottom: 16 }}>Image Previews</Title>
          <Row gutter={[16, 16]}>{previews}</Row>
        </div>
      </Space>
    </GlobalLayout>
  );
}