package types

// 默认是 0
type Setting struct {
	Id              int    `json:"id"`
	Favicon         string `json:"favicon"`
	Title           string `json:"title"`
	GovRecord       string `json:"govRecord"`
	Logo192         string `json:"logo192"`
	Logo512         string `json:"logo512"`
	HideAdmin       bool   `json:"hideAdmin"`
	HideGithub      bool   `json:"hideGithub"`
	JumpTargetBlank bool   `json:"jumpTargetBlank"`
}

type Token struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Value    string `json:"value"`
	Disabled int    `json:"disabled"`
}

type User struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Password string `json:"password"`
}
type Img struct {
	Id    int    `json:"id"`
	Url   string `json:"url"`
	Value string `json:"value"`
}

type Tool struct {
	Id      int    `json:"id"`
	Name    string `json:"name"`
	Url     string `json:"url"`
	Logo    string `json:"logo"`
	Catelog string `json:"catelog"`
	Desc    string `json:"desc"`
	Sort    int    `json:"sort"`
	Hide    bool   `json:"hide"`
}

type Catelog struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
	Sort int    `json:"sort"`
	Hide bool   `json:"hide"`
}

// Google AdSense 设置
type GoogleAdsense struct {
	Enabled     bool   `json:"enabled"`
	PublisherId string `json:"publisherId"`
	AdSlot      string `json:"adSlot"`
	AutoAdsCode string `json:"autoAdsCode"`
}

// Google Analytics 设置
type GoogleAnalytics struct {
	Enabled    bool   `json:"enabled"`
	TrackingId string `json:"trackingId"`
	GtmCode    string `json:"gtmCode"`
}

// 自定义广告设置
type CustomAds struct {
	Enabled     bool   `json:"enabled"`
	HeaderCode  string `json:"headerCode"`
	FooterCode  string `json:"footerCode"`
	SidebarCode string `json:"sidebarCode"`
}

// 广告设置
type AdsSettings struct {
	Id              int             `json:"id"`
	GoogleAdsense   GoogleAdsense   `json:"googleAdsense"`
	GoogleAnalytics GoogleAnalytics `json:"googleAnalytics"`
	CustomAds       CustomAds       `json:"customAds"`
}

// SEO设置
type SeoSettings struct {
	Id              int    `json:"id"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	Keywords        string `json:"keywords"`
	Author          string `json:"author"`
	OgTitle         string `json:"ogTitle"`
	OgDescription   string `json:"ogDescription"`
	OgImage         string `json:"ogImage"`
	OgUrl           string `json:"ogUrl"`
	TwitterCard     string `json:"twitterCard"`
	TwitterSite     string `json:"twitterSite"`
	TwitterCreator  string `json:"twitterCreator"`
	Canonical       string `json:"canonical"`
	Robots          string `json:"robots"`
	GoogleSiteVerification string `json:"googleSiteVerification"`
	BaiduSiteVerification  string `json:"baiduSiteVerification"`
	BingSiteVerification   string `json:"bingSiteVerification"`
}
