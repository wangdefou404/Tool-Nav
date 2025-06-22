import { useMemo } from "react";
import "./index.css";
import { getLogoUrl } from "../../utils/check";
import { getJumpTarget } from "../../utils/setting";
const Card = ({ title, url, des, logo, catelog, onClick, index, isSearching }) => {
  const el = useMemo(() => {
    if (url === "admin") {
      return <img src={logo} alt={title} />
    } else {
        return <img src={getLogoUrl(logo)} alt={title} />
    }
  }, [logo, title, url])
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
