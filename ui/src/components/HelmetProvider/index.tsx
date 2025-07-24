import React from 'react';
import { Helmet } from 'react-helmet';

// 创建一个包装器来处理 UNSAFE_componentWillMount 警告
interface HelmetProviderProps {
  children: React.ReactNode;
}

export const HelmetProvider: React.FC<HelmetProviderProps> = ({ children }) => {
  // react-helmet 不需要 Provider，直接返回 children
  return <>{children}</>;
};

// 创建一个安全的 Helmet 组件
interface SafeHelmetProps {
  children: React.ReactNode;
}

export const SafeHelmet: React.FC<SafeHelmetProps> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 只在客户端渲染时显示 Helmet
  if (!mounted) {
    return null;
  }

  return (
    <Helmet>
      {children}
    </Helmet>
  );
};

export { Helmet };
export default SafeHelmet;