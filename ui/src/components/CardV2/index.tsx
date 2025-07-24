import { useMemo, useState } from "react";
import { getLogoUrl } from "../../utils/check";
import { getJumpTarget } from "../../utils/setting";

interface CardProps {
  title: string;
  url: string;
  des: string;
  logo: string;
  catelog: string;
  onClick: () => void;
  index: number;
  isSearching: boolean;
}

const Card = ({ title, url, des, logo, catelog, onClick, index, isSearching }: CardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // 默认占位图标
  const defaultIcon = useMemo(() => (
    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 dark:from-blue-500 dark:to-blue-700 rounded-lg flex items-center justify-center">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-white"
      >
        <path 
          d="M12 2L2 7L12 12L22 7L12 2Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M2 17L12 22L22 17" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M2 12L12 17L22 12" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  ), []);

  const logoElement = useMemo(() => {
    if (url === "admin") {
      return (
        <img 
          src={logo} 
          alt={title} 
          className="w-12 h-12 rounded-lg object-cover"
          onError={() => setImageError(true)} 
        />
      );
    } else {
      if (imageError || !logo) {
        return defaultIcon;
      }
      const logoUrl = getLogoUrl(logo);
      if (!logoUrl) {
        return defaultIcon;
      }
      return (
        <img 
          src={logoUrl} 
          alt={title} 
          className="w-12 h-12 rounded-lg object-cover transition-transform duration-200 group-hover:scale-110"
          onError={() => setImageError(true)}
        />
      );
    }
  }, [logo, title, url, imageError, defaultIcon]);

  const showNumIndex = index < 10 && isSearching;

  return (
    <a
      href={url === "toggleJumpTarget" ? undefined : url}
      onClick={(e) => {
        if (url === "toggleJumpTarget") {
          e.preventDefault();
        }
        onClick();
      }}
      target={getJumpTarget() === "blank" ? "_blank" : "_self"}
      rel="noreferrer"
      className="group relative block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-modern p-4 h-full flex flex-col relative overflow-hidden">
        {/* 搜索序号 */}
        {showNumIndex && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 dark:bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
            {index + 1}
          </div>
        )}
        
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 dark:to-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 内容区域 */}
        <div className="relative z-10 flex flex-col h-full">
          {/* 头部：图标和标题 */}
          <div className="flex items-start space-x-3 mb-3">
            <div className="flex-shrink-0">
              {logoElement}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {title}
              </h3>
              {catelog && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {catelog}
                </span>
              )}
            </div>
          </div>
          
          {/* 描述 */}
          {des && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
              {des}
            </p>
          )}
          
          {/* 悬停效果指示器 */}
          <div className={`mt-3 flex items-center text-xs text-primary-500 dark:text-blue-400 font-medium transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-x-1' : 'opacity-0 translate-x-0'
          }`}>
            <span>访问工具</span>
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
};

export default Card;
