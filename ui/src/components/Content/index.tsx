import "./index.css";
import CardV2 from "../CardV2";
import SearchBar from "../SearchBar";
import { Loading } from "../Loading";
import { SafeHelmet as Helmet } from "../HelmetProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FetchList } from "../../utils/api";
import TagSelector from "../TagSelector";
import pinyin from "pinyin-match";
import GithubLink from "../GithubLink";
import DarkSwitch from "../DarkSwitch";
import { generateSearchEngineCard } from "../../utils/serachEngine";
import { toggleJumpTarget } from "../../utils/setting";
import { message } from "antd";

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
  const [error, setError] = useState<string>("");
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
      setError("");
      const r = await FetchList();
      setData(r);
      const tagInLocalStorage = window.localStorage.getItem("tag");
      if (tagInLocalStorage && tagInLocalStorage !== "") {
        if (r?.catelogs && r?.catelogs.includes(tagInLocalStorage)) {
          setCurrTag(tagInLocalStorage);
        }
      }
      message.success("AI工具加载成功！");
    } catch (e) {
      console.log(e);
      setError("加载失败，请刷新页面重试");
      message.error("加载AI工具失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setCurrTag, setError]);
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

  // 获取分类名称的辅助函数
  const getCategoryName = useCallback((catelogId: string | number) => {
    if (!data.catelogs) return "未分类";
    
    // 如果是字符串且不是数字，直接返回
    if (typeof catelogId === 'string' && isNaN(Number(catelogId))) {
      return catelogId;
    }
    
    // 转换为数字进行查找
    const id = Number(catelogId);
    if (isNaN(id)) return "未分类";
    
    // 在分类数组中查找对应的分类名称
    // data.catelogs[0] 是 "全部工具"，从索引1开始是实际分类
    if (id >= 1 && id < data.catelogs.length) {
      return data.catelogs[id];
    }
    
    return "未分类";
  }, [data.catelogs]);

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
      }).map((item: any) => ({
        ...item,
        catelogName: getCategoryName(item.catelog)
      }));
      if (searchResults.length > 0) {
        organized["搜索结果"] = [...searchResults, ...generateSearchEngineCard(searchString)];
      } else {
        organized["搜索结果"] = generateSearchEngineCard(searchString);
      }
      return organized;
    }
    
    // 如果选择了特定分类，只显示该分类
    if (currTag !== "全部工具") {
      const categoryTools = data.tools.filter((item: any) => {
        const categoryName = getCategoryName(item.catelog);
        return categoryName === currTag;
      }).map((item: any) => ({
        ...item,
        catelogName: getCategoryName(item.catelog)
      }));
      if (categoryTools.length > 0) {
        organized[currTag] = categoryTools;
      }
      return organized;
    }
    
    // 显示全部工具时，按分类组织
    data.tools.forEach((item: any) => {
      const categoryName = getCategoryName(item.catelog);
      if (!organized[categoryName]) {
        organized[categoryName] = [];
      }
      organized[categoryName].push({
        ...item,
        catelogName: categoryName
      });
    });
    
    return organized;
  }, [data, currTag, searchString, getCategoryName]);

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
    
    if (categories.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor"/>
            </svg>
          </div>
          <h3 className="empty-title">未找到相关工具</h3>
          <p className="empty-message">
            {searchString ? `没有找到与"${searchString}"相关的AI工具` : "当前分类下没有工具"}
          </p>
          {searchString && (
            <button 
              onClick={() => {
                setVal("");
                setSearchString("");
                resetSearch();
              }}
              className="clear-search-button"
            >
              清除搜索
            </button>
          )}
        </div>
      );
    }
    
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
                catelog={item.catelogName || getCategoryName(item.catelog)}
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
        {/* 全新的页面头部设计 */}
        <div className="page-header">
          <div className="page-header-container">
            {/* 简洁的标题区域 */}
            <div className="hero-section">
              <h1 className="hero-title">得否AI工具箱</h1>
              <p className="hero-subtitle">发现最好的AI工具，提升工作效率</p>
            </div>
            
            {/* 集成的搜索区域 */}
            <div className="search-section">
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
        </div>
        <div className="content-wraper">
          <div className="categories-container">
            {loading ? (
              <Loading />
            ) : error ? (
              <div className="error-container">
                <div className="error-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-red-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke="currentColor"/>
                  </svg>
                </div>
                <h3 className="error-title">加载失败</h3>
                <p className="error-message">{error}</p>
                <button 
                  onClick={loadData}
                  className="retry-button"
                >
                  重新加载
                </button>
              </div>
            ) : (
              renderCardsV2()
            )}
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
