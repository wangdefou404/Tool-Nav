import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Switch, Space, Typography } from 'antd';
import { CheckIcon } from '@radix-ui/react-icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface AdsSettings {
  googleAdsense: {
    enabled: boolean;
    publisherId: string;
    adSlot: string;
    autoAdsCode: string;
  };
  googleAnalytics: {
    enabled: boolean;
    trackingId: string;
    gtmCode: string;
  };
  customAds: {
    enabled: boolean;
    headerCode: string;
    footerCode: string;
    sidebarCode: string;
  };
}

export const AdsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [adsSettings, setAdsSettings] = useState<AdsSettings>({
    googleAdsense: {
      enabled: false,
      publisherId: '',
      adSlot: '',
      autoAdsCode: ''
    },
    googleAnalytics: {
      enabled: false,
      trackingId: '',
      gtmCode: ''
    },
    customAds: {
      enabled: false,
      headerCode: '',
      footerCode: '',
      sidebarCode: ''
    }
  });

  useEffect(() => {
    loadAdsSettings();
  }, []);

  const loadAdsSettings = async () => {
    try {
      const response = await fetch('/api/admin/ads/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAdsSettings(data.data);
          form.setFieldsValue(data.data);
        }
      }
    } catch (error) {
      console.error('加载广告设置失败:', error);
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ads/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('_token')}`
        },
        body: JSON.stringify(values)
      });

      const result = await response.json();
      if (result.success) {
        message.success('广告设置保存成功');
        setAdsSettings(values);
      } else {
        message.error(result.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败');
      console.error('保存广告设置失败:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Title level={2}>广告管理</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={adsSettings}
      >
        {/* Google AdSense 设置 */}
        <Card title="Google AdSense 设置" className="mb-6">
          <Form.Item name={['googleAdsense', 'enabled']} valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          
          <Form.Item
            name={['googleAdsense', 'publisherId']}
            label="发布者ID (pub-xxxxxxxxxx)"
            tooltip="Google AdSense 发布者ID，格式如：pub-1234567890123456"
          >
            <Input placeholder="pub-1234567890123456" />
          </Form.Item>

          <Form.Item
            name={['googleAdsense', 'autoAdsCode']}
            label="自动广告代码"
            tooltip="从Google AdSense复制的完整自动广告代码"
          >
            <TextArea
              rows={6}
              placeholder="<script async src=&quot;https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxx&quot;&#10;     crossorigin=&quot;anonymous&quot;></script>"
            />
          </Form.Item>

          <Form.Item
            name={['googleAdsense', 'adSlot']}
            label="广告位ID"
            tooltip="特定广告位的ID，用于展示位置广告"
          >
            <Input placeholder="1234567890" />
          </Form.Item>
        </Card>

        {/* Google Analytics 设置 */}
        <Card title="Google Analytics 设置" className="mb-6">
          <Form.Item name={['googleAnalytics', 'enabled']} valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          
          <Form.Item
            name={['googleAnalytics', 'trackingId']}
            label="跟踪ID (GA4测量ID)"
            tooltip="Google Analytics 4 测量ID，格式如：G-XXXXXXXXXX"
          >
            <Input placeholder="G-XXXXXXXXXX" />
          </Form.Item>

          <Form.Item
            name={['googleAnalytics', 'gtmCode']}
            label="Google Tag Manager 代码"
            tooltip="完整的GTM代码"
          >
            <TextArea
              rows={6}
              placeholder="<!-- Google Tag Manager -->&#10;<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>&#10;<!-- End Google Tag Manager -->"
            />
          </Form.Item>
        </Card>

        {/* 自定义广告代码 */}
        <Card title="自定义广告代码" className="mb-6">
          <Form.Item name={['customAds', 'enabled']} valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
          
          <Form.Item
            name={['customAds', 'headerCode']}
            label="页头广告代码"
            tooltip="将在网站头部显示的广告代码"
          >
            <TextArea
              rows={4}
              placeholder="在此输入页头广告代码..."
            />
          </Form.Item>

          <Form.Item
            name={['customAds', 'footerCode']}
            label="页脚广告代码"
            tooltip="将在网站底部显示的广告代码"
          >
            <TextArea
              rows={4}
              placeholder="在此输入页脚广告代码..."
            />
          </Form.Item>

          <Form.Item
            name={['customAds', 'sidebarCode']}
            label="侧边栏广告代码"
            tooltip="将在网站侧边栏显示的广告代码"
          >
            <TextArea
              rows={4}
              placeholder="在此输入侧边栏广告代码..."
            />
          </Form.Item>
        </Card>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CheckIcon />}
            >
              保存设置
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Card title="使用说明" className="mt-6">
        <div className="space-y-4">
          <div>
            <Text strong>Google AdSense:</Text>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>启用后，自动广告代码将添加到网站头部</li>
              <li>发布者ID用于验证广告主身份</li>
              <li>广告位ID可用于在特定位置展示广告</li>
            </ul>
          </div>
          
          <div>
            <Text strong>Google Analytics:</Text>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>用于网站流量统计和分析</li>
              <li>建议同时配置GTM来管理所有标签</li>
            </ul>
          </div>
          
          <div>
            <Text strong>自定义广告:</Text>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>可以添加任何第三方广告代码</li>
              <li>支持页头、页脚和侧边栏位置</li>
              <li>请确保代码的安全性和合法性</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdsPage; 