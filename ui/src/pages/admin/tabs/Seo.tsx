import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Typography, Divider } from 'antd';
import { 
  InfoCircleOutlined, 
  GlobalOutlined, 
  MessageOutlined, 
  SearchOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface SeoSettings {
  id: number;
  title: string;
  description: string;
  keywords: string;
  author: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  canonical: string;
  robots: string;
  googleSiteVerification: string;
  baiduSiteVerification: string;
  bingSiteVerification: string;
}

const SeoTab: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    id: 1,
    title: '',
    description: '',
    keywords: '',
    author: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogUrl: '',
    twitterCard: 'summary_large_image',
    twitterSite: '',
    twitterCreator: '',
    canonical: '',
    robots: 'index,follow',
    googleSiteVerification: '',
    baiduSiteVerification: '',
    bingSiteVerification: '',
  });

  // 获取SEO设置
  const fetchSeoSettings = async () => {
    try {
      const response = await fetch('/api/admin/seo/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSeoSettings(data.data);
        form.setFieldsValue(data.data);
      }
    } catch (error) {
      console.error('获取SEO设置失败:', error);
      message.error('获取SEO设置失败');
    }
  };

  // 更新SEO设置
  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/seo/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('_token')}`,
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        message.success('SEO设置更新成功');
        setSeoSettings(values);
      } else {
        message.error(data.errorMessage || 'SEO设置更新失败');
      }
    } catch (error) {
      console.error('更新SEO设置失败:', error);
      message.error('更新SEO设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  return (
    <div className="space-y-6">
      <Title level={2}>SEO设置</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={seoSettings}
      >
        {/* 基础SEO设置 */}
        <Card 
          title={
            <span>
              <GlobalOutlined style={{ marginRight: 8 }} />
              基础SEO设置
            </span>
          } 
          className="mb-6"
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            配置网站的基础SEO信息，这些信息将显示在搜索引擎结果中
          </Text>
          
          <Form.Item
            name="title"
            label="网站标题 *"
            tooltip="建议长度：50-60个字符"
            rules={[{ required: true, message: '请输入网站标题' }]}
          >
            <Input 
              placeholder="得否AI工具箱 - 发现最好的AI工具"
              maxLength={60}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="网站描述 *"
            tooltip="建议长度：120-160个字符"
            rules={[{ required: true, message: '请输入网站描述' }]}
          >
            <TextArea
              placeholder="得否AI工具箱是一个精选的AI工具导航站，帮助您发现最好的人工智能工具，提升工作效率。包含AI聊天、图像生成、代码助手等各类AI工具。"
              maxLength={160}
              showCount
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="关键词"
            tooltip="多个关键词用英文逗号分隔，建议3-8个关键词"
          >
            <Input placeholder="AI工具,人工智能,ChatGPT,Claude,AI导航,工具箱,效率工具" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="author"
              label="作者"
              style={{ flex: 1 }}
            >
              <Input placeholder="得否" />
            </Form.Item>

            <Form.Item
              name="robots"
              label="爬虫指令"
              tooltip="常用值：index,follow（允许索引和跟踪）、noindex,nofollow（禁止索引和跟踪）"
              style={{ flex: 1 }}
            >
              <Input placeholder="index,follow" />
            </Form.Item>
          </div>

          <Form.Item
            name="canonical"
            label="规范链接"
            tooltip="指定页面的规范URL，有助于避免重复内容问题"
          >
            <Input placeholder="https://yourdomain.com" />
          </Form.Item>
        </Card>

        {/* Open Graph设置 */}
        <Card 
          title={
            <span>
              <MessageOutlined style={{ marginRight: 8 }} />
              Open Graph设置
            </span>
          } 
          className="mb-6"
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            配置社交媒体分享时显示的信息（Facebook、LinkedIn等）
          </Text>
          
          <Form.Item
            name="ogTitle"
            label="OG标题"
            tooltip="社交分享时显示的标题，留空则使用网站标题"
          >
            <Input placeholder="得否AI工具箱" />
          </Form.Item>

          <Form.Item
            name="ogDescription"
            label="OG描述"
            tooltip="社交分享时显示的描述，留空则使用网站描述"
          >
            <TextArea
              placeholder="发现最好的AI工具，提升工作效率"
              rows={2}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="ogImage"
              label="OG图片"
              tooltip="社交分享时显示的图片，建议尺寸：1200x630px"
              style={{ flex: 1 }}
            >
              <Input placeholder="/logo512.png" />
            </Form.Item>

            <Form.Item
              name="ogUrl"
              label="OG网址"
              tooltip="页面的完整URL地址"
              style={{ flex: 1 }}
            >
              <Input placeholder="https://yourdomain.com" />
            </Form.Item>
          </div>
        </Card>

        {/* Twitter卡片设置 */}
        <Card 
          title={
            <span>
              <MessageOutlined style={{ marginRight: 8 }} />
              Twitter卡片设置
            </span>
          } 
          className="mb-6"
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            配置Twitter分享时显示的卡片信息
          </Text>
          
          <Form.Item
            name="twitterCard"
            label="卡片类型"
            tooltip="推荐使用大图摘要卡片以获得更好的视觉效果"
          >
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '100%', padding: '4px 11px', border: '1px solid #d9d9d9', borderRadius: '6px' }}
            >
              <option value="summary">摘要卡片</option>
              <option value="summary_large_image">大图摘要卡片</option>
              <option value="app">应用卡片</option>
              <option value="player">播放器卡片</option>
            </select>
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="twitterSite"
              label="Twitter站点账号"
              tooltip="网站的Twitter账号，以@开头"
              style={{ flex: 1 }}
            >
              <Input placeholder="@yoursite" />
            </Form.Item>

            <Form.Item
              name="twitterCreator"
              label="Twitter创作者账号"
              tooltip="内容创作者的Twitter账号，以@开头"
              style={{ flex: 1 }}
            >
              <Input placeholder="@creator" />
            </Form.Item>
          </div>
        </Card>

        {/* 站点验证设置 */}
        <Card 
          title={
            <span>
              <SearchOutlined style={{ marginRight: 8 }} />
              搜索引擎验证
            </span>
          } 
          className="mb-6"
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            配置各大搜索引擎的站点验证代码
          </Text>
          
          <Form.Item
            name="googleSiteVerification"
            label="Google站点验证"
            tooltip="在Google Search Console中获取的验证代码（不包含meta标签）"
          >
            <Input placeholder="abcdefghijklmnopqrstuvwxyz123456" />
          </Form.Item>

          <Form.Item
            name="baiduSiteVerification"
            label="百度站点验证"
            tooltip="在百度搜索资源平台中获取的验证代码（不包含meta标签）"
          >
            <Input placeholder="abcdefghijklmnopqrstuvwxyz123456" />
          </Form.Item>

          <Form.Item
            name="bingSiteVerification"
            label="必应站点验证"
            tooltip="在Bing Webmaster Tools中获取的验证代码（不包含meta标签）"
          >
            <Input placeholder="abcdefghijklmnopqrstuvwxyz123456" />
          </Form.Item>
        </Card>

        {/* 使用说明 */}
        <Card 
          title={
            <span>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              使用说明
            </span>
          } 
          className="mb-6"
        >
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div style={{ marginBottom: 12 }}>
              <strong>基础SEO设置：</strong>
              <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: '4px 0' }}>
                <li>网站标题和描述是最重要的SEO元素，会直接影响搜索排名</li>
                <li>关键词应该与网站内容相关，避免堆砌</li>
                <li>规范链接有助于避免重复内容被搜索引擎惩罚</li>
              </ul>
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>社交媒体优化：</strong>
              <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: '4px 0' }}>
                <li>Open Graph标签控制在Facebook、LinkedIn等平台的分享显示</li>
                <li>Twitter卡片专门优化Twitter平台的分享效果</li>
                <li>建议上传1200x630px的高质量分享图片</li>
              </ul>
            </div>
            <div>
              <strong>搜索引擎验证：</strong>
              <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: '4px 0' }}>
                <li>验证后可以在各搜索引擎管理工具中查看网站数据</li>
                <li>只需填入验证代码，系统会自动生成完整的meta标签</li>
                <li>建议同时验证Google、百度和必应三大搜索引擎</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 保存按钮 */}
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? '保存中...' : '保存SEO设置'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SeoTab; 