import React from "react";
import { Layout, theme, Typography } from "antd";
import Sidebar from "../leftSidebar";
import ConversionSummary from "../rightSideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

const { Header, Content } = Layout;
const { Title } = Typography;

const GlobalLayout = ({ children, conversionData }) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', background: colorBgContainer, borderBottom: '1px solid #1e2739' }} >
                <FontAwesomeIcon icon={faBolt} /><Title level={2} style={{ margin: 0 }}>HEIC 2 JPG</Title>
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