// ConverterCenter.jsx (güncellenmiş)
import React, { useMemo, useRef, useState } from "react";
import {
  Typography, Upload, Button, Row, Col, Card, Space, message, Image, Progress,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faPlay } from "@fortawesome/free-solid-svg-icons";

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function ConverterCenter() {
  const [items, setItems] = useState([]);
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    const newOnes = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
      origUrl: URL.createObjectURL(file),
      convUrl: null,
      status: "idle",
      progress: 0,
    }));
    setItems((prev) => [...prev, ...newOnes]);
  };

  const draggerProps = {
    multiple: true,
    accept: ".heic,.HEIC",
    beforeUpload: (file) => {
      addFiles([file]);
      message.success(`${file.name} eklendi`);
      return Upload.LIST_IGNORE;
    },
    showUploadList: false,
  };

  const setStatus = (id, patch) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const callConvertApi = async (file, onBump) => {
    const fd = new FormData();
    fd.append("images", file);
    const res = await fetch("/api/convert", { method: "POST", body: fd });
    if (!res.ok) throw new Error("API error");
    // küçük “sahte” ilerleme darbeleri
    for (const p of [35, 60, 85]) {
      await new Promise((r) => setTimeout(r, 120));
      onBump?.(p);
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
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

  // === Concurrency-limited Convert All ===
  const convertAll = async (limit = 3) => {
    const queue = items.filter((it) => it.status !== "done");
    if (!queue.length) return;

    let idx = 0;
    const workers = new Array(Math.min(limit, queue.length)).fill(0).map(async () => {
      while (idx < queue.length) {
        const currentIndex = idx++;
        const it = queue[currentIndex];
        // bireysel dönüşümü çalıştır
        await convertOne(it.id);
      }
    });

    await Promise.all(workers);
  };

  const previews = useMemo(
    () =>
      items.map((f) => (
        <Col xs={12} sm={8} md={6} key={f.id}>
          <Card
            hoverable
            bordered={false}
            bodyStyle={{ padding: 12 }}
            style={{ borderRadius: 18, background: "#101826" }}
            cover={
              <div
                style={{
                  borderRadius: 16, overflow: "hidden", margin: 12, background: "#0e1722",
                  height: 160, display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}
              >
                <Image
                  src={f.convUrl ?? f.origUrl}
                  alt={f.name}
                  preview={{ mask: "Önizle" }}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    opacity: f.status === "converting" ? 0.6 : 1, transition: "opacity .2s",
                  }}
                />
                {f.status === "converting" && (
                  <div
                    style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      backdropFilter: "blur(1px)",
                    }}
                  >
                    <Progress type="circle" percent={f.progress} size={64} strokeColor="#4dabff" />
                  </div>
                )}
              </div>
            }
            actions={[
              <Button
                key="convert"
                type={f.status === "done" ? "default" : "primary"}
                onClick={() => convertOne(f.id)}
                disabled={f.status === "converting"}
              >
                {f.status === "done" ? "Reconvert" : "Convert"}
              </Button>,
              f.convUrl ? (
                <Button
                  key="download"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = f.convUrl;
                    a.download = f.name.replace(/\.(heic)$/i, ".jpg");
                    a.click();
                  }}
                >
                  Download
                </Button>
              ) : (
                <span key="sp" />
              ),
            ]}
          >
            <Space direction="vertical" size={2} style={{ width: "100%" }}>
              <Text style={{ opacity: 0.85, fontSize: 12 }}>{f.name}</Text>
              <Text type={f.status === "error" ? "danger" : "secondary"} style={{ fontSize: 12 }}>
                {f.status === "idle" && "Ready"}
                {f.status === "converting" && "Converting…"}
                {f.status === "done" && "Converted"}
                {f.status === "error" && "Error"}
              </Text>
            </Space>
          </Card>
        </Col>
      )),
    [items]
  );

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <Title level={1} style={{ margin: 0, fontSize: 48, lineHeight: 1.1 }}>
          Convert HEIC to JPG with Ease
        </Title>
        <Text style={{ opacity: 0.8, fontSize: 18 }}>
          Drag and drop your HEIC files, or browse to upload. We&apos;ll handle the rest.
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
          <Space direction="vertical" align="center" style={{ width: "100%" }}>
            <FontAwesomeIcon icon={faCloudArrowUp} style={{ fontSize: 42, opacity: 0.9 }} />
            <Title level={4} style={{ margin: 0 }}>Drag and drop files here</Title>
            <Text style={{ opacity: 0.75 }}>or</Text>
            <Button type="primary" size="large" onClick={() => inputRef.current?.click()}>
              Browse Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".heic,.HEIC"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />
            <Button icon={<FontAwesomeIcon icon={faPlay} />} onClick={() => convertAll(3)}>
              Convert All (x3)
            </Button>
          </Space>
        </Dragger>

        <div>
          <Title level={3} style={{ marginBottom: 16 }}>Image Previews</Title>
          <Row gutter={[16, 16]}>{previews}</Row>
        </div>
      </Space>
    </>
  );
}