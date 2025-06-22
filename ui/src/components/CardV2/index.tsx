import { useMemo, useState } from "react";
import "./index.css";
import { getLogoUrl } from "../../utils/check";
import { getJumpTarget } from "../../utils/setting";
const Card = ({ title, url, des, logo, catelog, onClick, index, isSearching }) => {
  const [imageError, setImageError] = useState(false);
  
  // 默认占位图标 SVG
  const defaultIcon = useMemo(() => (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="default-icon"
      style={{ backgroundColor: '#f0f0f0', borderRadius: '4px', padding: '4px' }}
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
  ), []);

  const el = useMemo(() => {
    if (url === "admin") {
      return <img src={logo} alt={title} onError={() => setImageError(true)} />
    } else {
      if (imageError) {
        return defaultIcon;
      }
      return (
        <img 
          src={getLogoUrl(logo)} 
          alt={title} 
          onError={() => setImageError(true)}
        />
      );
    }
  }, [logo, title, url, imageError, defaultIcon])
  const showNumIndex = index < 10 && isSearching;
  return (
    <a
      href={url === "toggleJumpTarget" ? undefined : url}
      onClick={() => {
        onClick();
      }}
      target={getJumpTarget() === "blank" ? "_blank" : "_self"}
      rel="noreferrer"
      className="card-box"
    >
      {showNumIndex && <span className="card-index">{index + 1}</span>}
      <div className="card-content">
        <div className="card-left">
          {el}
          {/* {url === "admin" ? (
            <img src={logo} alt={title} />
          ) : (
            <img src={`/api/img?url=${logo}`} alt={title} />
          )} */}
        </div>
        <div className="card-right">
          <div className="card-right-top">
            <h3 className="card-right-title" title={title}>{title}</h3>
            <span className="card-tag" title={catelog}>{catelog}</span>
          </div>
          <h4 className="card-right-bottom" title={des}>{des}</h4>
        </div>
      </div>
    </a>
  );
};

export default Card;
