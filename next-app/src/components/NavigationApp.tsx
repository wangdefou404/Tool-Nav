'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';

interface Tool {
  id: number;
  name: string;
  url: string;
  desc?: string;
  logo?: string;
  catelog?: string | number;
  sort?: number;
  hide?: boolean;
}

interface Setting {
  id: number;
  favicon?: string;
  title?: string;
  gov_record?: string;
  logo192?: string;
  logo512?: string;
  hide_admin?: boolean;
  hide_github?: boolean;
  jump_target_blank?: boolean;
}

interface NavigationData {
  tools: Tool[];
  catelogs: string[];
  setting?: Setting;
}

const mutiSearch = (searchString: string, tools: Tool[]) => {
  const query = searchString.toLowerCase();
  return tools
    .map(tool => {
      const name = tool.name?.toLowerCase() || '';
      const desc = tool.desc?.toLowerCase() || '';
      const score = name.includes(query) ? 2 : desc.includes(query) ? 1 : 0;
      return { item: tool, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
};

const getLogoUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    return `/api/img?url=${encodeURIComponent(url)}`;
  }
  return url;
};



export default function NavigationApp() {
  const [data, setData] = useState<NavigationData>({ tools: [], catelogs: ['全部工具'] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currTag, setCurrTag] = useState('全部工具');
  const [searchString, setSearchString] = useState('');
  const [val, setVal] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [jumpTargetBlank, setJumpTargetBlank] = useState(true);

  const filteredDataRef = useRef<Tool[]>([]);

  const showGithub = useMemo(() => {
    const hide = data?.setting?.hide_github === true;
    return !hide;
  }, [data]);

  // 获取分类名称的辅助函数
  const getCategoryName = useCallback((catelogId: string | number) => {
    if (!data.catelogs) return '未分类';
    
    // 如果是字符串且不是数字，直接返回
    if (typeof catelogId === 'string' && isNaN(Number(catelogId))) {
      return catelogId;
    }
    
    // 转换为数字进行查找
    const id = Number(catelogId);
    if (isNaN(id)) return '未分类';
    
    // 在分类数组中查找对应的分类名称
    if (id >= 1 && id < data.catelogs.length) {
      return data.catelogs[id];
    }
    
    return '未分类';
  }, [data.catelogs]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api');
      const result = await response.json();
      
      if (result.success) {
        const apiData = result.data;
        
        // 构建分类列表
        const catelogs = ['全部工具'];
        if (apiData.catelogs) {
           apiData.catelogs.forEach((item: { name: string }) => {
             catelogs.push(item.name);
           });
        }
        
        // 添加管理后台工具
        const tools = [...(apiData.tools || [])];
        if (!apiData.setting?.hide_admin) {
          tools.push({
            id: 999999999999,
            catelog: '管理后台',
            name: '本站管理后台',
            desc: '本导航站的管理后台哦',
            url: '/admin',
            logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAD+FJREFUeF7tnQnQd2MZxn9iGGJEJaHSJLTY94qIUkiKVHbZ2oyyL1myRCJUUyJLUomUNVKksu9tSJMmpI0aYjIZzeU7H++3/N/3/M+5z3POcz/3PXPm/YznuZ/7vq7n+p/l2eYgLBAIBEYiMEdgEwgEAqMRCIFE7wgEJkEgBBLdIxAIgUQfCASaIRB3kGa4Ra1CEAiBFEJ0pNkMgRBIM9yiViEIhEDSE70ksHR1LQYsAMxf/dW/ZY9V1+PV34eAe6vr/vQhl9tiCKRb7pcA1gI2BFYHlgHmbtnkU8A9wE3AFcD1wAMtfUb1EQiEQOy7xgbARsCalTjsW5jVo0RyA3AZcFWKBktpIwRiw/RywGbAe4BVbFw29nIr8EPgB8CvGnuJis8iEAJp1xHeB+wIbNLOTWe1LwHOAL7fWQvOHYdAmhG8XSWMdZtVT17rmkooZydvOfMGQyDjEbgVsBew6njVBlP6FuBE4NzBRDTwQEIg9QhaA9gb2KJe8cGXOh84Hrhx8JH2HGAIZHIC5gUOrcQxZ89cWTf/dCWSw4EnrZ178RcCGc3k8sBJQC7vGU37pN5PPgnc1dSB53ohkNmzq69TJwOLeyZ/Qm4PAnvE161Z2Q6BzIrJvsCxhQhj5jT3A44rNPfZph0CmRGWU4BPFN5BvgTsXjgGz6UfAnm+J+jLzubRMZ5F4AJHX+xaURoCmQbf1QW8jI/bUfTyvt64lbyVD4FMm7e0qTdijfK5qJpfZuQuPjelC0Qv43opDxuNgF7a9fJepJUskMOqQcAiiR8zaQ0mCq/irFSBhDjG7+rCTEIpykoUyNbAOUWxbJfsNsC37NwN31NpAtGkQ626W3j41Awywkeq1ZLFTHIsSSAShcQhkYQ1R0Di0JJiicW9lSSQ04Cd3DOaJsHTgZ3TNNVvK6UIZGNAy0/D7BDQMuNL7dwN01MpAomRcvv+V8RIewkC0TRuresIs0dA60i0LMCteRfIotUGa69wy2C/if252hDv4X7D6K517wI5ADi6O/jCM3AgcIxXJDwLRPvd3g4s5ZW8geR1H7ASoH2E3ZlngWjRj+vn4wH1Rr3nabGZO/MskNuqXzZ3pA0wId2pVx5gXK1D8ioQ7ZGrvWnD0iGgvYm1tsaVeRWI9qPdwRVTw0/mzGo71uFHOkaEHgXyMuB3wEJj4BBF2yPwKPA64K/tXQ3Hg0eB7Ap8bTgQFxXJbsCpnjL2KBDND9Js07D0CGi2tOa9uTFvAnkRoPP8tKduWHoEtMevzl38V/qmu2nRm0D0JeXCbqAKrzUReK+nL4jeBKKzL/asSWQU6waBL1ZnqHTjPbFXbwLRgNWKiTGM5mZE4A5PA7SeBDIf8J/orYNA4IXAE4OIpGUQngSiO4fuIGH9I6DJi7qTZG+eBLIl8N3sGfGRwAeA8zyk4kkgBwOf9UCKgxwOAY50kIerc9K/CWhjs7D+EdDGfNv2H0b7CDzdQa4F1m4PSXgwQODnwDoGfnp34Ukg8Ym39+70XABuPvV6EoiWfr5mOH2k6Ej+4GWpsyeBaJr1IkV3y+Ek/zdAyw6yN08C0SChBgvD+kdAg4QaLMzePAnkf8Cc2TPiI4Gngbk8pOJJIJpivaAHUhzk8G9ASw+yN08CeQBYPHtGfCTwILCEh1Q8CeRuYBkPpDjI4R5gWQd5uBpJvxlY1QMpDnK4BVjNQR6uBBJHHAynR7o5GsHTI5Z2MtGOJmH9I6CdTbTDSfbmSSCfBo7PnhEfCewNfMFDKp4EoiPBLvZAioMc3u3lyDtPAlka0NeTsP4R0NfEe/sPo30EngQiNJ5pD0l4MEDATb9yk0hF6o+ADQ0IDhfNEbgCeGfz6sOq6U0gewEnDAvi4qL5FKD9yVyYN4GsBVzngpl8k3gTcH2+4c8YuTeBKDudvOpiHlCGnUzz4VydKOxRIDrIZfsMO5eHkM/ydnCRR4HoG/xFHnpbhjls6m0syqNA1K+0acAKGXawnEO+0+O+yF4Foo3Ljsi5t2UY+2c8btznVSCvB36TYSfLOeQ3AL/NOYHZxe5VIMr1bC+7+2XQ6bSr5XYZxDl2iJ4F8g5Ao7ph3SOg2QtXdt9M+hY8C0RoSiASSlh3CEgYbqf3eBeINlDWo1ZYdwjo0UqPWC7Nu0BEWmxq3V3XdbNJ9SiIShDIuwCd3x1mj4DOo7/c3u1wPJYgEKF9MrD7cGB3EckpwB4uMpkkiVIEsiigx4GlvBOaKD/tpK+zWB5O1F5vzZQiEAEcL+x23cz1i/lEmEoSiPL+PKAdN8KaI6CdY/ZpXj2vmqUJROzE2EjzPup6zGN2sJQokOWrUV8XB7w07+tj19QBRRp0vWvsmhlXKFEgoutDwLkZ89ZH6FsB3+6j4T7bLFUgwjx2Yqzf89zslFg/5WklSxaI8j8MOHRc0Aorf3iFU2Fph0CmEx4iGd31ixZH3EGe7xgfBk4v8idydNI7Ad8oHZPSH7Em8v9+4LzSO0SV/5bA9wKLeAeZuQ+ESCDEMaFXxB1k1p/JDYBjgZUL+wW9DdgPuKqwvCdNNwQye3heDHwO2LmQznIasD/wz0LyrZ1mCGRyqD4G6EvOS2ojmlfBf1Sfub+SV9jpog2BTI21DubRQNkuUxfNqsTXqyPrXBx00xXyIZD6yOrMCwll/fpVBlnyJ5UwdJZK2BQIhEDG7yIfAT4OvHH8qr3W+DXwZeCrvUaRWeMhkGaEzVuJRO8or27mIlmtPwJ6x5A4nkzWqpOGQiDtiHxpJZS3Azo4Zkimg4R+XAnj70MKLKdYQiB2bGmdidZLSCx9bVanBU0Shf4WtW7DjsYZPYVAukH2VcA61fVW4LXdNMPvgZ9Ve39p/68/ddROsW5DIGmoXxJYBdAnY106R1x/NSBZxzSAp8+xOgdef3XdCtxfp3KUaY5ACKQ5dhY15wYWmHDNXzl9HHhswvWURWMd+dAg6prAYtX1ckCX7C/V9RCg6wZAg5PZWAgkG6oGFajuiHrX2rzBxtXaNOOC6l1p8HfAEMig+t3gg9kE2BXQOZAWdjFwKnCJhbMufIRAukDVn09rYcyM0GCFEgLx15ktM1oDOMjwjjFVbBLKUcCNUxVM9f9DIKmQzq+dD1aDjAsnDv2RavD1O4nbnW1zIZAhsDC8GDSFRlNT+jTNd+t9Gn4IpM8uMMy29Uh15EBCO7h65OotnBBIb9CjCY8Tr/mq/+7z+Vufbod2GKem7Wj6TC8WAukWdg2iadR8+rXshH+ParkvToZ8tnxvZ7D3RUa33bI/71ojslo1B2tdQANq41ofnOhFXJs1rDRusInK3w5oMw29wCe1PshImmDHjb0S2BR4czXdookgZg6xD07Or0bFO4arlXuNvm/RykODyn2Q0SDMQVXR3CmJQpdGlPUeYWmpOdF0EQkkB5NAJJRklpqMZIl10JBOy50uDE3M68pSc/JTYL2ukjH2ezXwNmOfk7pLTUbK3Kza0tmG2yfcrCElJ8rrTCugEvnZATgrUVvFH38wCucFK1GoA6XeYTGlQG6qPiqk6m8W7dwMrG7hqI6PlGSUiafvMnMBGpySMCxeuJvkk4oTPTJe1iTAAdTZCLg8RRypyEiRS9s2Nq4m5q3V1lHL+qk4ORnYvWWsE6vfCeh95vrq0v8Tlrr03rCCYVunAHsY+hvpKhUZKXJp2sYilTCSAF4jyFScaD37UjXiqVNE54ho/tZ/RxSep5pXpXNYLOy+Dtf5zxBfKjIsQOnCxzaVODTCPRRLwYnWx99ilLDW1ktsdUybV1htdbpqtS6/TruNy6Qgo3FwHVbUFJCjB7rfbgpOrI6d09ytcY9L0Ii4xdyqJMfDpSCjw37eyLVe8CQOy2fiRoGMqJSCEy1zbbsZtz4P79gw8TMAfa5tY9p8W8t/O7UUZHSawJjOrX45x2x2rOIpOLkU0A9FG3sL8MuGDjQ15xcN606vpi9w+rDSqaUgo9MEajpfrjoQp22nqNlcq2IpOLnD4A6qCY6PNsx0IYOJh/pqtmLD9mtXS0FG7WA6KqhjC7SjuXY7zMFScKK9etscCqTtetpu2q1NtduMNWl/Le2N3KmlIKPTBKZwrq9Uet7VAGAuloKTZ1qCcY3B/C3Nq9KSgDbWOVadN9Am+5Z1PzqENc0NckjBSQikJjEpyKgZimmxfauTak2dJnKWgpMQSE0yU5BRMxSzYvsAx5l5S+8oBSchkJq8piCjZigmxXKegDcdgBSchEBqdrcUZNQMpXUxvfDpxS93S8FJCKRmL0lBRs1QWhXTFpnaWt+DpeAkBFKzp6Qgo2YojYvp6DOtU7aamdo4EKOKKTgJgdQkKwUZNUNpVEwbKOi8ib7XcDQKfkSltpzUGVto+yiqcRBNFmxjhxqMg9RZS69YG1tbMho3bFTRYtKdUShmbtpy4uVdzAJQCahYgWiB00kWKA7MRwjEjpBiBaIlnHq0ymkKSV3aQyB1kZq6XJEC0RJZiaPzmZxT499JiRCIHaxFCuQ0YCc7DAfnKQRiR0lxAhni9vx2dE7zFAKxQ7Q4gWgVmaaTeLYQiB27RQkkx20ym1AdAmmC2uzrFCMQ7aB+neMX84n0hkBCIGMjcEC1E8nYFTOsEAKxI62IO4g+694GLG6H26A9hUDs6ClCICXdPeIrlp045Mm9QDQZUXcPLzN169Afd5A6KNUr414gewIn1sPCTakQiB2VrgWieVa6e2jTt5IsBGLHtmuB7FZt+GYHVx6eQiB2PLkWyJWAppaUZiEQO8bdCkQzdXV4fIkWArFj3a1ADgGOsMMpK08hEDu63ApEJ5nqBKESLQRix7pLgSgpHQZZqoVA7Jh3KRCNe2j8o1QLgdgx71IgdwPL2GGUnacQiB1l7gSy5oQztu1gystTCMSOL3cCOQg40g6fLD2FQOxocycQHSm8vh0+WXoKgdjR5kog8wBPAC+wwydLTyEQO9pcCWQT4GI7bLL1FAKxo86VQI4B9rfDJltPIRA76lwJ5BxgaztssvUUArGjzpVArgXWtsMmW08hEDvqXAmk7cHydrD26ykEYoe/K4E8HV+wnu0ZIZAQyCwIaEufB+xwydpTCMSOPjd3kJhi8nynCIGEQGZBYDPgQjtcsvYUArGjz80dZBdA5w2GxTuIZR9wI5ADgaMskcnYV9xB7MhzI5ATgL3scMnaUwjEjj43Ajkb2NYOl6w9hUDs6HMjkEuBjexwydpTCMSOPjcCWdcOk+w9tTr4HggsZ+wCrfBs+2uVfW+MBAKByRAIgUT/CAQmQSAEEt0jEAiBRB8IBJohEHeQZrhFrUIQCIEUQnSk2QyBEEgz3KJWIQiEQAohOtJshkAIpBluUasQBEIghRAdaTZDIATSDLeoVQgCIZBCiI40myEQAmmGW9QqBIEQSCFER5rNEAiBNMMtahWCQAikEKIjzWYI/B8wVQHnPijpqwAAAABJRU5ErkJggg=='
          });
        }
        
        // 添加跳转方式切换工具
        const jumpIcon = jumpTargetBlank ? 
          'data:image/png;base64,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' :
          'data:image/png;base64,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';
        
        tools.push({
          id: 999099999978,
          catelog: '偏好设置',
          name: jumpTargetBlank ? '新建窗口' : '原地跳转',
          desc: '点击切换跳转方式',
          url: 'toggleJumpTarget',
          logo: jumpIcon
        });
        
        setData({
          tools,
          catelogs,
          setting: apiData.setting
        });
        
        const tagInLocalStorage = localStorage.getItem('tag');
        if (tagInLocalStorage && tagInLocalStorage !== '' && catelogs.includes(tagInLocalStorage)) {
          setCurrTag(tagInLocalStorage);
        }
      } else {
        setError('加载失败，请刷新页面重试');
      }
    } catch (e) {
      console.error(e);
      setError('加载失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  }, [jumpTargetBlank]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // 初始化主题
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
    
    // 初始化跳转方式
    const savedJumpTarget = localStorage.getItem('jumpTarget');
    setJumpTargetBlank(savedJumpTarget !== 'self');
  }, []);

  const handleSetCurrTag = (tag: string) => {
    setCurrTag(tag);
    if (tag !== '管理后台') {
      localStorage.setItem('tag', tag);
    }
    resetSearch(true);
  };

  const resetSearch = (notSetTag?: boolean) => {
    setVal('');
    setSearchString('');
    const tagInLocalStorage = localStorage.getItem('tag');
    if (!notSetTag && tagInLocalStorage && tagInLocalStorage !== '' && tagInLocalStorage !== '管理后台') {
      setCurrTag(tagInLocalStorage);
    }
  };

  const handleSetSearch = (val: string) => {
    if (val !== '' && val) {
      setCurrTag('全部工具');
      setSearchString(val.trim());
    } else {
      resetSearch();
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const toggleJumpTarget = () => {
    const newTarget = !jumpTargetBlank;
    setJumpTargetBlank(newTarget);
    localStorage.setItem('jumpTarget', newTarget ? 'blank' : 'self');
    loadData(); // 重新加载数据以更新图标
  };

  // 过滤数据
  const filteredData = useMemo(() => {
    let filtered = data.tools;

    // 分类过滤
     if (currTag !== '全部工具') {
       filtered = filtered.filter(tool => {
         const categoryName = getCategoryName(tool.catelog || '');
         return categoryName === currTag;
       });
     }

    // 搜索过滤
    if (searchString) {
      const searchResults = mutiSearch(searchString, filtered);
      filtered = searchResults.map(result => result.item);
    }

    filteredDataRef.current = filtered;
    return filtered;
  }, [data.tools, currTag, searchString, getCategoryName]);

  const handleToolClick = (tool: Tool) => {
    if (tool.url === 'toggleJumpTarget') {
      toggleJumpTarget();
      return;
    }

    const target = jumpTargetBlank ? '_blank' : '_self';
    window.open(tool.url, target);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.setting?.title || '导航工具'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              {/* GitHub 链接 */}
              {showGithub && (
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="GitHub"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetSearch(val);
                }
              }}
              placeholder="搜索工具..."
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            {val && (
              <button
                onClick={() => {
                  setVal('');
                  resetSearch();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Tags */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {data.catelogs.map((category) => (
              <button
                key={category}
                onClick={() => handleSetCurrTag(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  currTag === category
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredData.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0">
                     <Image
                       src={getLogoUrl(tool.logo)}
                       alt={tool.name}
                       width={48}
                       height={48}
                       className="w-12 h-12 rounded-lg object-cover"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzM3NDE1MSIvPgo8cGF0aCBkPSJNMjAgMTBMMjUgMjBIMTVMMjAgMTBaIiBmaWxsPSIjNjM2NjcwIi8+CjxwYXRoIGQ9Ik0yMCAzMEwyNSAyMEgxNUwyMCAzMFoiIGZpbGw9IiM2MzY2NzAiLz4KPC9zdmc+';
                       }}
                     />
                   </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                       {getCategoryName(tool.catelog || '')}
                     </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {tool.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.207-2.175C5.25 11.758 5.25 10.172 5.25 8.25 5.25 6.328 6.828 4.75 8.75 4.75S12.25 6.328 12.25 8.25c0 1.922-.578 3.508-1.543 4.575z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {searchString ? '没有找到相关工具' : '暂无工具'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchString ? '尝试使用其他关键词搜索' : '请稍后再试'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}