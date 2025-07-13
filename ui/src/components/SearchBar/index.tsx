import { useEffect, useState } from "react";
import "./index.css";

interface SearchBarProps {
  setSearchText: (t: string) => void;
  searchString: string;
}

const SearchBar = ({ setSearchText, searchString }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const onKeyDown = (ev: KeyboardEvent) => {
    const reg = /[a-zA-Z0-9]|[\u4e00-\u9fa5]/g;
    if (ev.code === "Enter" || reg.test(ev.key)) {
      const el = document.getElementById("search-bar");
      if (el && !isFocused) {
        el.focus();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFocused]);

  return (
    <div className="search-bar-modern">
      <div className="search-input-container">
        {/* 搜索图标 */}
        <div className="search-icon">
          <svg 
            className="h-5 w-5 text-gray-400 dark:text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        {/* 搜索输入框 */}
        <input
          id="search-bar"
          type="search"
          placeholder="搜索AI工具..."
          value={searchString}
          onChange={(ev) => setSearchText(ev.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input"
        />
        
        {/* 快捷键提示 */}
        {!isFocused && !searchString && (
          <div className="search-shortcuts">
            <kbd className="shortcut-key">⌘K</kbd>
          </div>
        )}
        
        {/* 清除按钮 */}
        {searchString && (
          <button
            onClick={() => setSearchText('')}
            className="clear-button"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* 搜索结果提示 */}
      {searchString && (
        <div className="search-results-hint">
          <div className="hint-item">
            <kbd>Enter</kbd>
            <span>打开首个结果</span>
          </div>
          <div className="hint-item">
            <kbd>↑↓</kbd>
            <span>选择结果</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;