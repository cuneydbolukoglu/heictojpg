import React from "react";
import { Layout, Card, Typography, Progress, Button, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft } from "@fortawesome/free-solid-svg-icons";

const { Sider } = Layout;
const { Title, Text } = Typography;

export default function ConversionSummary() {
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
                            4
                        </Title>
                    </div>

                    <div>
                        <Text style={{ color: "#aab8c2" }}>Total File Size:</Text>
                        <Title level={4} style={{ margin: 0, color: "#4dabff" }}>
                            12.8 MB
                        </Title>
                    </div>

                    <div>
                        <Text style={{ color: "#aab8c2" }}>Conversion Progress</Text>
                        <Progress
                            percent={25}
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
                            <span>25%</span>
                            <span>1 of 4 converted</span>
                        </div>
                    </div>
                </Space>
            </Card>
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
            >
                Convert All
            </Button>
        </Sider>
    );
}
