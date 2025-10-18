import React from "react";
import { Layout, theme, Typography, Spin } from "antd";
import Sidebar from "../leftSidebar";
import ConversionSummary from "../rightSideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

const { Header, Content } = Layout;
const { Title } = Typography;

const GlobalLayout = ({ children, conversionData, loading = false }) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                background: colorBgContainer,
                borderBottom: '1px solid #1e2739',
                padding: '0 24px',
                height: '64px',
            }} >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FontAwesomeIcon icon={faBolt} style={{ fontSize: '24px', color: '#4dabff' }} />
                    <Title level={2} style={{ margin: 0, color: '#fff' }}>HEIC 2 JPG</Title>
                </div>
            </Header>
            <Layout>
                <Sidebar />
                <Layout>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: colorBgContainer,
                            //   borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
                <ConversionSummary conversionData={conversionData} />
            </Layout>
        </Layout>
    );
};

export default GlobalLayout;