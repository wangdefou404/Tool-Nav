package service

import (
	"github.com/mereith/nav/database"
	"github.com/mereith/nav/logger"
	"github.com/mereith/nav/types"
)

// 获取广告设置
func GetAdsSettings() types.AdsSettings {
	var adsSettings types.AdsSettings
	
	// 查询广告设置
	query := `SELECT 
		id, 
		google_adsense_enabled, google_adsense_publisher_id, google_adsense_ad_slot, google_adsense_auto_ads_code,
		google_analytics_enabled, google_analytics_tracking_id, google_analytics_gtm_code,
		custom_ads_enabled, custom_ads_header_code, custom_ads_footer_code, custom_ads_sidebar_code
	FROM nav_ads_settings WHERE id = 1`
	
	row := database.DB.QueryRow(query)
	err := row.Scan(
		&adsSettings.Id,
		&adsSettings.GoogleAdsense.Enabled, &adsSettings.GoogleAdsense.PublisherId, &adsSettings.GoogleAdsense.AdSlot, &adsSettings.GoogleAdsense.AutoAdsCode,
		&adsSettings.GoogleAnalytics.Enabled, &adsSettings.GoogleAnalytics.TrackingId, &adsSettings.GoogleAnalytics.GtmCode,
		&adsSettings.CustomAds.Enabled, &adsSettings.CustomAds.HeaderCode, &adsSettings.CustomAds.FooterCode, &adsSettings.CustomAds.SidebarCode,
	)
	
	if err != nil {
		// 如果没有记录，返回默认值
		logger.LogInfo("广告设置未找到，返回默认值: %v", err)
		return types.AdsSettings{
			Id: 1,
			GoogleAdsense: types.GoogleAdsense{
				Enabled:     false,
				PublisherId: "",
				AdSlot:      "",
				AutoAdsCode: "",
			},
			GoogleAnalytics: types.GoogleAnalytics{
				Enabled:    false,
				TrackingId: "",
				GtmCode:    "",
			},
			CustomAds: types.CustomAds{
				Enabled:     false,
				HeaderCode:  "",
				FooterCode:  "",
				SidebarCode: "",
			},
		}
	}
	
	return adsSettings
}

// 更新广告设置
func UpdateAdsSettings(adsSettings types.AdsSettings) error {
	// 检查记录是否存在
	var count int
	checkQuery := `SELECT COUNT(*) FROM nav_ads_settings WHERE id = 1`
	row := database.DB.QueryRow(checkQuery)
	err := row.Scan(&count)
	if err != nil {
		logger.LogError("检查广告设置记录失败: %v", err)
		return err
	}
	
	var query string
	if count == 0 {
		// 插入新记录
		query = `INSERT INTO nav_ads_settings (
			id,
			google_adsense_enabled, google_adsense_publisher_id, google_adsense_ad_slot, google_adsense_auto_ads_code,
			google_analytics_enabled, google_analytics_tracking_id, google_analytics_gtm_code,
			custom_ads_enabled, custom_ads_header_code, custom_ads_footer_code, custom_ads_sidebar_code
		) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	} else {
		// 更新现有记录
		query = `UPDATE nav_ads_settings SET 
			google_adsense_enabled = ?, google_adsense_publisher_id = ?, google_adsense_ad_slot = ?, google_adsense_auto_ads_code = ?,
			google_analytics_enabled = ?, google_analytics_tracking_id = ?, google_analytics_gtm_code = ?,
			custom_ads_enabled = ?, custom_ads_header_code = ?, custom_ads_footer_code = ?, custom_ads_sidebar_code = ?
		WHERE id = 1`
	}
	
	stmt, err := database.DB.Prepare(query)
	if err != nil {
		logger.LogError("准备广告设置SQL语句失败: %v", err)
		return err
	}
	defer stmt.Close()
	
	_, err = stmt.Exec(
		adsSettings.GoogleAdsense.Enabled, adsSettings.GoogleAdsense.PublisherId, adsSettings.GoogleAdsense.AdSlot, adsSettings.GoogleAdsense.AutoAdsCode,
		adsSettings.GoogleAnalytics.Enabled, adsSettings.GoogleAnalytics.TrackingId, adsSettings.GoogleAnalytics.GtmCode,
		adsSettings.CustomAds.Enabled, adsSettings.CustomAds.HeaderCode, adsSettings.CustomAds.FooterCode, adsSettings.CustomAds.SidebarCode,
	)
	
	if err != nil {
		logger.LogError("更新广告设置失败: %v", err)
		return err
	}
	
	logger.LogInfo("广告设置更新成功")
	return nil
}

// 获取启用的广告代码用于前端显示
func GetEnabledAdsCode() map[string]string {
	adsSettings := GetAdsSettings()
	result := make(map[string]string)
	
	// Google AdSense 自动广告代码
	if adsSettings.GoogleAdsense.Enabled && adsSettings.GoogleAdsense.AutoAdsCode != "" {
		result["adsenseCode"] = adsSettings.GoogleAdsense.AutoAdsCode
	}
	
	// Google Analytics 代码
	if adsSettings.GoogleAnalytics.Enabled {
		if adsSettings.GoogleAnalytics.GtmCode != "" {
			result["gtmCode"] = adsSettings.GoogleAnalytics.GtmCode
		} else if adsSettings.GoogleAnalytics.TrackingId != "" {
			// 生成GA4代码
			gaCode := `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=` + adsSettings.GoogleAnalytics.TrackingId + `"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '` + adsSettings.GoogleAnalytics.TrackingId + `');
</script>`
			result["gaCode"] = gaCode
		}
	}
	
	// 自定义广告代码
	if adsSettings.CustomAds.Enabled {
		if adsSettings.CustomAds.HeaderCode != "" {
			result["headerCode"] = adsSettings.CustomAds.HeaderCode
		}
		if adsSettings.CustomAds.FooterCode != "" {
			result["footerCode"] = adsSettings.CustomAds.FooterCode
		}
		if adsSettings.CustomAds.SidebarCode != "" {
			result["sidebarCode"] = adsSettings.CustomAds.SidebarCode
		}
	}
	
	return result
} 