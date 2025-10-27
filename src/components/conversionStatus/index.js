import { List, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, DownloadOutlined } from "@ant-design/icons";

export const ConversionStatus = ({
  files,
  onReset,
  onDownloadAll,
}) => {
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
  const convertingCount = files.filter(f => f.status === "converting").length;

  return (
    <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold m-0 text-card-foreground">
          {convertingCount > 0 ? `${files.length} dosyadan ${convertingCount} tanesi dönüştürülüyor...` : 
           successCount === files.length ? "Tüm dönüştürmeler tamamlandı!" : 
           "Dönüştürme sonuçları"}
        </h2>
        {allComplete && (
          <div className="flex gap-2">
            {hasSuccess && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={onDownloadAll}
                className="!bg-primary hover:!bg-primary/90"
              >
                Tümünü İndir
              </Button>
            )}
            <Button onClick={onReset}>
              Daha Fazla Dönüştür
            </Button>
          </div>
        )}
      </div>
      
      <List
        dataSource={files}
        renderItem={(file) => (
          <List.Item
            className="!bg-muted/50 !p-4 !rounded-lg !mb-3 !border !border-border hover:!bg-muted/70 transition-colors"
            actions={file.status === "success" && file.downloadUrl ? [
              <Button
                type="default"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(file)}
              >
                İndir
              </Button>
            ] : []}
          >
            <List.Item.Meta
              avatar={
                file.status === "converting" ? (
                  <LoadingOutlined className="text-xl text-primary animate-spin" />
                ) : file.status === "success" ? (
                  <CheckCircleOutlined className="text-xl text-success" />
                ) : (
                  <CloseCircleOutlined className="text-xl text-destructive" />
                )
              }
              title={<span className="text-card-foreground font-medium">{file.fileName}</span>}
              description={
                file.status === "converting" ? (
                  <span className="text-muted-foreground">Dönüştürülüyor...</span>
                ) : file.status === "success" ? (
                  <span className="text-success">Başarıyla dönüştürüldü</span>
                ) : (
                  <span className="text-destructive">
                    {file.errorMessage || "Dönüştürme başarısız"}
                  </span>
                )
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};
