export const isLogin = () => {
  return localStorage.getItem('_token') ? true : false
}

export const getLogoUrl = (url: string | undefined) => {
  if (!url) {
    return '';
  }
  if (url.startsWith('http')) {
    return `/api/img?url=${url}`
  } else {
    return url;
  }
}