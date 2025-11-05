import { List, Button, Flex, Space, Typography, Image, Card, Spin } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faArrowRotateRight, faDownload } from "@fortawesome/free-solid-svg-icons";

const { Text } = Typography;

export const ConversionStatus = ({ files, onReset, onDownloadAll }) => {
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
        <Card>
            <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                <Space direction="vertical" size={8}>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: 600,
                    }}>
                        {convertingCount > 0
                            ? `Converting ${convertingCount} of ${totalCount} files...`
                            : successCount === totalCount
                                ? "All conversions completed!"
                                : "Conversion Results"
                        }
                    </Text>
                </Space>
                {allComplete && (
                    <Space>
                        {hasSuccess && (
                            <Button
                                type="primary"
                                icon={<FontAwesomeIcon icon={faDownload} />}
                                onClick={onDownloadAll}
                                size="large"
                            >
                                Download All ({successCount})
                            </Button>
                        )}
                        <Button
                            onClick={onReset}
                            icon={<FontAwesomeIcon icon={faArrowRotateRight} />}
                            size="large"
                        >
                            Convert More
                        </Button>
                    </Space>
                )}
            </Flex>
            <List
                dataSource={files}
                renderItem={(file) => (
                    <List.Item
                        style={{
                            padding: '16px',
                            borderRadius: 8,
                            marginBottom: 8,
                            opacity: file.status === "converting" ? 0.7 : 1
                        }}
                        actions={file.status === "success" ? [
                            <Button
                                key="download"
                                type="link"
                                icon={<FontAwesomeIcon icon={faDownload} />}
                                onClick={() => handleDownload(file)}
                                size="large"
                            />
                        ] : file.status === "error" ? [
                            <Button
                                key="retry"
                                type="default"
                                onClick={() => { }}
                                size="middle"
                            >
                                Retry
                            </Button>
                        ] : []}
                    >
                        <List.Item.Meta
                            avatar={
                                file.status === "converting" ? (
                                    <Spin percent="auto" />
                                ) : file.status === "success" ? (
                                    <Image
                                        width={50}
                                        height={50}
                                        src={file.downloadUrl}
                                        alt={file.fileName}
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: 6
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
                                        <FontAwesomeIcon icon={faCircleXmark} style={{ fontSize: 24, color: '#ff4d4f' }} />
                                    </div>
                                )
                            }
                            title={
                                <Text style={{
                                    fontWeight: 500,
                                    fontSize: 14
                                }}>
                                    {file.fileName}
                                </Text>
                            }
                            description={
                                <Text style={{
                                    color: file.status === "success" ? '#52c41a' :
                                        file.status === "error" && '#ff4d4f',
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
        </Card>
    );
};