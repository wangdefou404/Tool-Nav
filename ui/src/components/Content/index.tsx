import "./index.css";
import CardV2 from "../CardV2";
import SearchBar from "../SearchBar";
import { Loading } from "../Loading";
import { Helmet } from "react-helmet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FetchList } from "../../utils/api";
import TagSelector from "../TagSelector";
import pinyin from "pinyin-match";
import GithubLink from "../GithubLink";
import DarkSwitch from "../DarkSwitch";
import { isLogin } from "../../utils/check";
import { generateSearchEngineCard } from "../../utils/serachEngine";
import { toggleJumpTarget } from "../../utils/setting";

const mutiSearch = (s, t) => {
  const source = (s as string).toLowerCase();
  const target = t.toLowerCase();
  const rawInclude = source.includes(target);
  const pinYinInlcude = Boolean(pinyin.match(source, target));
  return rawInclude || pinYinInlcude;
};

const Content = (props: any) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currTag, setCurrTag] = useState("全部工具");
  const [searchString, setSearchString] = useState("");
  const [val, setVal] = useState("");

  const filteredDataRef = useRef<any>([]);

  const showGithub = useMemo(() => {
    const hide = data?.setting?.hideGithub === true
    return !hide;
  }, [data])
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const r = await FetchList();
      setData(r);
      const tagInLocalStorage = window.localStorage.getItem("tag");
      if (tagInLocalStorage && tagInLocalStorage !== "") {
        if (r?.catelogs && r?.catelogs.includes(tagInLocalStorage)) {
          setCurrTag(tagInLocalStorage);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setCurrTag]);
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSetCurrTag = (tag: string) => {
    setCurrTag(tag);
    // 管理后台不记录了
    if (tag !== "管理后台") {
      window.localStorage.setItem("tag", tag);
    }
    resetSearch(true);
  };

  const resetSearch = (notSetTag?: boolean) => {
    setVal("");
    setSearchString("");
    const tagInLocalStorage = window.localStorage.getItem("tag");
    if (!notSetTag && tagInLocalStorage && tagInLocalStorage !== "" && tagInLocalStorage !== "管理后台") {
      setCurrTag(tagInLocalStorage);
    }
  };

  const handleSetSearch = (val: string) => {
    if (val !== "" && val) {
      setCurrTag("全部工具");
      setSearchString(val.trim());
    } else {
      resetSearch();
    }
  }





  useEffect(() => {
    if (searchString.trim() === "") {
      document.removeEventListener("keydown", onKeyEnter);
    } else {
      document.addEventListener("keydown", onKeyEnter);
    }
    return () => {
      document.removeEventListener("keydown", onKeyEnter);
    }
    // eslint-disable-next-line
  }, [searchString])

  // 按分类组织工具数据，但保持原来的布局
  const organizedData = useMemo(() => {
    if (!data.tools) return {};
    
    const organized: { [key: string]: any[] } = {};
    
    // 如果是搜索模式，显示所有匹配的工具在"搜索结果"分类下
    if (searchString.trim() !== "") {
      const searchResults = data.tools.filter((item: any) => {
        return (
          mutiSearch(item.name, searchString) ||
          mutiSearch(item.desc, searchString) ||
          mutiSearch(item.url, searchString)
        );
      });
      if (searchResults.length > 0) {
        organized["搜索结果"] = [...searchResults, ...generateSearchEngineCard(searchString)];
      } else {
        organized["搜索结果"] = generateSearchEngineCard(searchString);
      }
      return organized;
    }
    
    // 如果选择了特定分类，只显示该分类
    if (currTag !== "全部工具") {
      const categoryTools = data.tools.filter((item: any) => item.catelog === currTag);
      if (categoryTools.length > 0) {
        organized[currTag] = categoryTools;
      }
      return organized;
    }
    
    // 显示全部工具时，按分类组织
    data.tools.forEach((item: any) => {
      const category = item.catelog || "未分类";
      if (!organized[category]) {
        organized[category] = [];
      }
      organized[category].push(item);
    });
    
    return organized;
  }, [data, currTag, searchString]);

  useEffect(() => {
    // 将组织化的数据展平为数组，用于键盘导航
    const flatData: any[] = [];
    Object.values(organizedData).forEach((tools: any[]) => {
      flatData.push(...tools);
    });
    filteredDataRef.current = flatData;
  }, [organizedData]);

  const renderCardsV2 = useCallback(() => {
    const categories = Object.keys(organizedData);
    
    return categories.map((category) => {
      const tools = organizedData[category];
      
      return (
        <div key={category} className="category-section">
          <h2 className="category-title">{category}</h2>
          <div className="category-tools">
            {tools.map((item, index) => (
              <CardV2
                title={item.name}
                url={item.url}
                des={item.desc}
                logo={item.logo}
                key={item.id || `${category}-${index}`}
                catelog={item.catelog}
                index={index}
                isSearching={searchString.trim() !== ""}
                onClick={() => {
                  resetSearch();
                  if (item.url === "toggleJumpTarget") {
                    toggleJumpTarget();
                    loadData();
                  }
                }}
              />
            ))}
          </div>
        </div>
      );
    });
    // eslint-disable-next-line
  }, [organizedData, searchString]);

  const onKeyEnter = (ev: KeyboardEvent) => {
    const cards = filteredDataRef.current;
    // 使用 keyCode 防止与中文输入冲突
    if (ev.keyCode === 13) {
      if (cards && cards.length) {
        window.open(cards[0]?.url, "_blank");
        resetSearch();
      }
    }
    // 如果按了数字键 + ctrl/meta，打开对应的卡片
    if (ev.ctrlKey || ev.metaKey) {
      const num = Number(ev.key);
      if (isNaN(num)) return;
      ev.preventDefault()
      const index = Number(ev.key) - 1;
      if (index >= 0 && index < cards.length) {
        window.open(cards[index]?.url, "_blank");
        resetSearch();
      }
    }

  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <link
          rel="icon"
          href={
            data?.setting?.favicon ?? "favicon.ico"
          }
        />
        <title>{data?.setting?.title ?? "得否AI工具箱"}</title>
      </Helmet>
      
      <div className="main-content">
        {/* 页面标题 */}
        <div className="header-title">
          <div className="header-title-content">
            <div className="title-wrapper">
              <h1 className="site-title">得否AI工具箱</h1>
              <p className="site-subtitle">发现最好的AI工具，提升工作效率</p>
            </div>
          </div>
        </div>
        
        <div className="topbar">
          <div className="content">
            <SearchBar
              searchString={val}
              setSearchText={(t) => {
                setVal(t);
                handleSetSearch(t);
              }}
            />
            <TagSelector
              tags={data?.catelogs ?? ["全部工具"]}
              currTag={currTag}
              onTagChange={handleSetCurrTag}
            />
          </div>
        </div>
        <div className="content-wraper">
          <div className="categories-container">
            {loading ? <Loading></Loading> : renderCardsV2()}
          </div>
        </div>
      </div>
      
      {/* 版权信息 */}
      <div className="footer-info">
        <div className="copyright">
          <p>© 2024 得否AI工具箱. All rights reserved.</p>
          <p>致力于为用户提供最优质的AI工具集合</p>
        </div>
        {data?.setting?.govRecord && (
          <div className="record-info">
            <a href="https://beian.miit.gov.cn" target="_blank" rel="noreferrer">
              {data.setting.govRecord}
            </a>
          </div>
        )}
      </div>
      {showGithub && <GithubLink />}
      <DarkSwitch showGithub={showGithub} />
    </>
  );
};

export default Content;
