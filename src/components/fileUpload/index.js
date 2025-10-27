import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

export const FileUpload = ({ onFileSelect, isConverting }) => {
  const handleChange = (info) => {
    const { fileList } = info;
    if (fileList.length > 0) {
      const files = fileList.map((file) => file.originFileObj).filter(Boolean);
      if (files.length > 0) {
        onFileSelect(files);
      }
    }
  };

  return (
    <Dragger
      multiple
      accept=".heic,.heif,image/heic,image/heif"
      showUploadList={false}
      beforeUpload={() => false}
      onChange={handleChange}
      disabled={isConverting}
      className="!bg-card !border-2 !border-dashed !border-border !rounded-2xl !p-5 hover:!border-primary transition-all"
    >
      <p className="ant-upload-drag-icon mb-4">
        <InboxOutlined className="text-[64px] text-primary" />
      </p>
      <p className="ant-upload-text !text-2xl !font-semibold !text-card-foreground !mb-2">
        Dosyaları seçin veya sürükleyin
      </p>
      <p className="ant-upload-hint !text-base !text-muted-foreground">
        Birden fazla HEIC/HEIF görüntüsü desteği
      </p>
    </Dragger>
  );
};