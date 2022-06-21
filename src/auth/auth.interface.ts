export interface AccessTokenInfo {
  accessToken: string
  expiresIn: number
  getTime: number
  openid: string
}

export interface AccessConfig {
  access_token: string
  refresh_token: string
  openid: string
  scope: string
  unionid?: string
  expires_in: number
}

export interface WechatError {
  errcode: number
  errmsg: string
}

export interface WechatUserInfo {
  openid: string
  nickname: string
  headimgurl: string
  unionid?: string
}

export interface WechatMiniOAuth2Info {
  socketId: string
  openid: string
  nickname: string
  avatar: string
}
