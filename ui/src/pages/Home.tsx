import React, { useEffect, useState } from 'react';
import { SafeHelmet as Helmet } from '../components/HelmetProvider';
import Content from '../components/Content';

interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  canonical?: string;
  googleSiteVerification?: string;
  baiduSiteVerification?: string;
  bingSiteVerification?: string;
}

const Home: React.FC = () => {
  const [seoMeta, setSeoMeta] = useState<SeoMeta>({});

  useEffect(() => {
    // 获取SEO元标签
    const fetchSeoMeta = async () => {
      try {
        const response = await fetch('/api/seo/meta');
        const data = await response.json();
        if (data.success) {
          setSeoMeta(data.data);
        }
      } catch (error) {
        console.error('获取SEO元标签失败:', error);
      }
    };

    fetchSeoMeta();
  }, []);

  return (
    <div className="App">
      <Helmet>
        {/* 基础SEO标签 */}
        <title>{seoMeta.title || '得否AI工具箱 - 发现最好的AI工具'}</title>
        <meta name="description" content={seoMeta.description || '得否AI工具箱是一个精选的AI工具导航站，帮助您发现最好的人工智能工具，提升工作效率。包含AI聊天、图像生成、代码助手等各类AI工具。'} />
        {seoMeta.keywords && <meta name="keywords" content={seoMeta.keywords} />}
        {seoMeta.author && <meta name="author" content={seoMeta.author} />}
        <meta name="robots" content={seoMeta.robots || 'index,follow'} />
        
        {/* Open Graph 标签 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoMeta.ogTitle || seoMeta.title || '得否AI工具箱'} />
        <meta property="og:description" content={seoMeta.ogDescription || seoMeta.description || '发现最好的AI工具，提升工作效率'} />
        {seoMeta.ogImage && <meta property="og:image" content={seoMeta.ogImage} />}
        {seoMeta.ogUrl && <meta property="og:url" content={seoMeta.ogUrl} />}
        
        {/* Twitter 卡片标签 */}
        <meta name="twitter:card" content={seoMeta.twitterCard || 'summary_large_image'} />
        {seoMeta.twitterSite && <meta name="twitter:site" content={seoMeta.twitterSite} />}
        {seoMeta.twitterCreator && <meta name="twitter:creator" content={seoMeta.twitterCreator} />}
        <meta name="twitter:title" content={seoMeta.ogTitle || seoMeta.title || '得否AI工具箱'} />
        <meta name="twitter:description" content={seoMeta.ogDescription || seoMeta.description || '发现最好的AI工具，提升工作效率'} />
        {seoMeta.ogImage && <meta name="twitter:image" content={seoMeta.ogImage} />}
        
        {/* 其他标签 */}
        {seoMeta.canonical && <link rel="canonical" href={seoMeta.canonical} />}
        {seoMeta.googleSiteVerification && <meta name="google-site-verification" content={seoMeta.googleSiteVerification} />}
        {seoMeta.baiduSiteVerification && <meta name="baidu-site-verification" content={seoMeta.baiduSiteVerification} />}
        {seoMeta.bingSiteVerification && <meta name="msvalidate.01" content={seoMeta.bingSiteVerification} />}
        
        {/* 移动端优化 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* 结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": seoMeta.title || "得否AI工具箱",
            "description": seoMeta.description || "得否AI工具箱是一个精选的AI工具导航站，帮助您发现最好的人工智能工具，提升工作效率。",
            "url": seoMeta.ogUrl || "https://aitools.wangdefou.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": (seoMeta.ogUrl || "https://aitools.wangdefou.com") + "?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <div className="main">
        <Content />
      </div>
    </div>
  );
};

export default Home;