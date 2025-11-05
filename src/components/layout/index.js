import { Layout, Typography } from "antd";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function GlobalLayout({ children }) {
  return (
    <Layout>
      <Header style={{ background: 'transparent', textAlign: 'center', margin: 48, height: '100%' }}>
        <Title
          level={1}
          style={{
            fontSize: '48px',
            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16
          }}
        >
          Convert HEIC to JPG
        </Title>
        <Paragraph
          style={{
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}
        >
          Instantly convert your HEIC images to JPG format. Fast, free, and completely private.
        </Paragraph>
      </Header>
      <Content>
        {children}
      </Content>
    </Layout>
  )
}