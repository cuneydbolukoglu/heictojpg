import React from "react";
import { Layout, Card, Typography, Progress, Button, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft } from "@fortawesome/free-solid-svg-icons";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function ConversionSummary({ conversionData = { items: [], convertAll: () => {} } }) {
    const { items = [], convertAll } = conversionData;
    
    const totalPhotos = items.length;
    const convertedPhotos = items.filter(item => item.status === 'done').length;
    const convertingPhotos = items.filter(item => item.status === 'converting').length;
    const errorPhotos = items.filter(item => item.status === 'error').length;
    
    const progressPercent = totalPhotos > 0 ? Math.round((convertedPhotos / totalPhotos) * 100) : 0;
    
    // Calculate total file size (approximate)
    const totalSize = items.reduce((total, item) => {
        if (item.file && item.file.size) {
            return total + item.file.size;
        }
        return total;
    }, 0);
    
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <Sider
            width={300}
            style={{
                background: "#0d1117",
                borderLeft: "1px solid rgba(255,255,255,0.04)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <Card
                style={{
                    background: "#0f1923",
                    borderRadius: 16,
                    color: "#fff",
                }}
                bordered={false}
            >
                <Title level={4} style={{ color: "#fff", marginBottom: 24 }}>
                    Conversion Summary
                </Title>

                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%", color: "#fff" }}
                >
                    <div>
                        <Text style={{ color: "#aab8c2" }}>Total Photos:</Text>
                        <Title level={4} style={{ margin: 0, color: "#fff" }}>
                            {totalPhotos}
                        </Title>
                    </div>

                    <div>
                        <Text style={{ color: "#aab8c2" }}>Total File Size:</Text>
                        <Title level={4} style={{ margin: 0, color: "#4dabff" }}>
                            {formatFileSize(totalSize)}
                        </Title>
                    </div>

                    <div>
                        <Text style={{ color: "#aab8c2" }}>Status:</Text>
                        <div style={{ marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ color: "#4dabff", fontSize: 12 }}>Converted:</Text>
                                <Text style={{ color: "#fff", fontSize: 12 }}>{convertedPhotos}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ color: "#ffa500", fontSize: 12 }}>Converting:</Text>
                                <Text style={{ color: "#fff", fontSize: 12 }}>{convertingPhotos}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ color: "#ff4d4f", fontSize: 12 }}>Errors:</Text>
                                <Text style={{ color: "#fff", fontSize: 12 }}>{errorPhotos}</Text>
                            </div>
                        </div>
                    </div>

                    {totalPhotos > 0 && (
                        <div>
                            <Text style={{ color: "#aab8c2" }}>Conversion Progress</Text>
                            <Progress
                                percent={progressPercent}
                                showInfo={false}
                                strokeColor="#4dabff"
                                style={{ marginTop: 8 }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    color: "#aab8c2",
                                    fontSize: 12,
                                    marginTop: 4,
                                }}
                            >
                                <span>{progressPercent}%</span>
                                <span>{convertedPhotos} of {totalPhotos} converted</span>
                            </div>
                        </div>
                    )}
                </Space>
            </Card>
            {totalPhotos > 0 && (
                <Button
                    type="primary"
                    size="large"
                    style={{
                        background: "#4dabff",
                        borderRadius: 12,
                        marginTop: 24,
                    }}
                    block
                    icon={<FontAwesomeIcon icon={faRightLeft}/>}
                    onClick={convertAll}
                    disabled={convertingPhotos > 0}
                >
                    {convertingPhotos > 0 ? 'Converting...' : 'Convert All'}
                </Button>
            )}
        </Sider>
    );
}
