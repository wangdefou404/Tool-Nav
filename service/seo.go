package service

import (
	"database/sql"
	"fmt"

	"github.com/mereith/nav/database"
	"github.com/mereith/nav/logger"
	"github.com/mereith/nav/types"
)

// 获取SEO设置
func GetSeoSettings() (*types.SeoSettings, error) {
	var seoSettings types.SeoSettings
	query := `SELECT id, title, description, keywords, author, og_title, og_description, og_image, og_url, 
	         twitter_card, twitter_site, twitter_creator, canonical, robots, 
	         google_site_verification, baidu_site_verification, bing_site_verification 
	         FROM nav_seo_settings WHERE id = 1`
	
	err := database.DB.QueryRow(query).Scan(
		&seoSettings.Id,
		&seoSettings.Title,
		&seoSettings.Description,
		&seoSettings.Keywords,
		&seoSettings.Author,
		&seoSettings.OgTitle,
		&seoSettings.OgDescription,
		&seoSettings.OgImage,
		&seoSettings.OgUrl,
		&seoSettings.TwitterCard,
		&seoSettings.TwitterSite,
		&seoSettings.TwitterCreator,
		&seoSettings.Canonical,
		&seoSettings.Robots,
		&seoSettings.GoogleSiteVerification,
		&seoSettings.BaiduSiteVerification,
		&seoSettings.BingSiteVerification,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			// 如果没有记录，返回默认设置
			return &types.SeoSettings{
				Id:          1,
				Title:       "得否AI工具箱 - 发现最好的AI工具",
				Description: "得否AI工具箱是一个精选的AI工具导航站，帮助您发现最好的人工智能工具，提升工作效率。包含AI聊天、图像生成、代码助手等各类AI工具。",
				Keywords:    "AI工具,人工智能,ChatGPT,Claude,AI导航,工具箱,效率工具",
				Author:      "得否",
				OgTitle:     "得否AI工具箱",
				OgDescription: "发现最好的AI工具，提升工作效率",
				OgImage:     "/logo512.png",
				OgUrl:       "",
				TwitterCard: "summary_large_image",
				TwitterSite: "",
				TwitterCreator: "",
				Canonical:   "",
				Robots:      "index,follow",
				GoogleSiteVerification: "",
				BaiduSiteVerification:  "",
				BingSiteVerification:   "",
			}, nil
		}
		return nil, fmt.Errorf("获取SEO设置失败: %v", err)
	}

	return &seoSettings, nil
}

// 更新SEO设置
func UpdateSeoSettings(seoSettings *types.SeoSettings) error {
	// 先检查是否存在记录
	var exists bool
	err := database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM nav_seo_settings WHERE id = 1)").Scan(&exists)
	if err != nil {
		return fmt.Errorf("检查SEO设置记录失败: %v", err)
	}

	if exists {
		// 更新记录
		query := `UPDATE nav_seo_settings SET 
		         title = ?, description = ?, keywords = ?, author = ?, 
		         og_title = ?, og_description = ?, og_image = ?, og_url = ?,
		         twitter_card = ?, twitter_site = ?, twitter_creator = ?, 
		         canonical = ?, robots = ?, google_site_verification = ?, 
		         baidu_site_verification = ?, bing_site_verification = ?
		         WHERE id = 1`
		
		_, err = database.DB.Exec(query,
			seoSettings.Title,
			seoSettings.Description,
			seoSettings.Keywords,
			seoSettings.Author,
			seoSettings.OgTitle,
			seoSettings.OgDescription,
			seoSettings.OgImage,
			seoSettings.OgUrl,
			seoSettings.TwitterCard,
			seoSettings.TwitterSite,
			seoSettings.TwitterCreator,
			seoSettings.Canonical,
			seoSettings.Robots,
			seoSettings.GoogleSiteVerification,
			seoSettings.BaiduSiteVerification,
			seoSettings.BingSiteVerification,
		)
	} else {
		// 插入新记录
		query := `INSERT INTO nav_seo_settings 
		         (id, title, description, keywords, author, og_title, og_description, og_image, og_url,
		         twitter_card, twitter_site, twitter_creator, canonical, robots, 
		         google_site_verification, baidu_site_verification, bing_site_verification)
		         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		
		_, err = database.DB.Exec(query,
			seoSettings.Title,
			seoSettings.Description,
			seoSettings.Keywords,
			seoSettings.Author,
			seoSettings.OgTitle,
			seoSettings.OgDescription,
			seoSettings.OgImage,
			seoSettings.OgUrl,
			seoSettings.TwitterCard,
			seoSettings.TwitterSite,
			seoSettings.TwitterCreator,
			seoSettings.Canonical,
			seoSettings.Robots,
			seoSettings.GoogleSiteVerification,
			seoSettings.BaiduSiteVerification,
			seoSettings.BingSiteVerification,
		)
	}

	if err != nil {
		return fmt.Errorf("更新SEO设置失败: %v", err)
	}

	logger.LogInfo("SEO设置更新成功")
	return nil
}

// 获取启用的SEO代码（用于前端渲染）
func GetEnabledSeoMeta() map[string]interface{} {
	seoSettings, err := GetSeoSettings()
	if err != nil {
		logger.LogError("获取SEO设置失败: %v", err)
		return map[string]interface{}{}
	}

	result := map[string]interface{}{
		"title":       seoSettings.Title,
		"description": seoSettings.Description,
		"keywords":    seoSettings.Keywords,
		"author":      seoSettings.Author,
		"robots":      seoSettings.Robots,
	}

	// Open Graph 标签
	if seoSettings.OgTitle != "" {
		result["ogTitle"] = seoSettings.OgTitle
	}
	if seoSettings.OgDescription != "" {
		result["ogDescription"] = seoSettings.OgDescription
	}
	if seoSettings.OgImage != "" {
		result["ogImage"] = seoSettings.OgImage
	}
	if seoSettings.OgUrl != "" {
		result["ogUrl"] = seoSettings.OgUrl
	}

	// Twitter 标签
	if seoSettings.TwitterCard != "" {
		result["twitterCard"] = seoSettings.TwitterCard
	}
	if seoSettings.TwitterSite != "" {
		result["twitterSite"] = seoSettings.TwitterSite
	}
	if seoSettings.TwitterCreator != "" {
		result["twitterCreator"] = seoSettings.TwitterCreator
	}

	// 其他标签
	if seoSettings.Canonical != "" {
		result["canonical"] = seoSettings.Canonical
	}
	if seoSettings.GoogleSiteVerification != "" {
		result["googleSiteVerification"] = seoSettings.GoogleSiteVerification
	}
	if seoSettings.BaiduSiteVerification != "" {
		result["baiduSiteVerification"] = seoSettings.BaiduSiteVerification
	}
	if seoSettings.BingSiteVerification != "" {
		result["bingSiteVerification"] = seoSettings.BingSiteVerification
	}

	return result
} 