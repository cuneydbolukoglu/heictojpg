import { Flex, Layout, Typography } from "antd";

const { Header, Footer, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function GlobalLayout({ children }) {
  return <Layout>
    {/* <Header>
      <Flex align="center">
        <Title>HEIC to JPG</Title>
        <Title level={6}>Convert your HEIC images to JPG format instantly. Fast, free, and completely private.</Title>
      </Flex>
    </Header> */}
    <Content>
      {children}
    </Content>
    {/* <Footer>Footer</Footer> */}
  </Layout>
}