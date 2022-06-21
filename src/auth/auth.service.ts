import { BadRequestException, HttpException, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { JwtService } from '@nestjs/jwt'
import { Observable, lastValueFrom, map } from 'rxjs'
import { AxiosResponse } from 'axios'
import {
  AccessConfig,
  AccessTokenInfo,
  WechatError,
  WechatMiniOAuth2Info, WechatUserInfo,
} from './auth.interface'
import { WechatMiniQRCodeCreateDto } from './dto/wechat-login.dto'
import { User } from '@/user/entities/user.entity'
import { UserService } from '@/user/user.service'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private httpService: HttpService,
  ) {}

  private accessTokenInfo: AccessTokenInfo
  private miniAccessTokenInfo: AccessTokenInfo
  public apiServer = 'https://api.weixin.qq.com'

  createToken(user: Partial<User>) {
    return this.jwtService.sign(user)
  }

  async login(user: Partial<User>) {
    const token = this.createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    })
    delete user.password
    return { token, ...user }
  }

  async loginWithWechat(code: string) {
    if (!code)
      throw new BadRequestException('请输入微信授权码')

    await this.getAccessToken(code)

    const user = await this.getUserByOpenid(this.accessTokenInfo.openid)
    if (!user) {
      // 获取用户信息，注册新用户
      const userInfo: WechatUserInfo = await this.getUserInfo()
      return this.userService.registerByWechat(userInfo)
    }
    return this.login(user)
  }

  async getUser(user) {
    return await this.userService.findOne(user.id)
  }

  async getUserByOpenid(openid: string) {
    return await this.userService.findByOpenid(openid)
  }

  async getUserInfo() {
    const result: AxiosResponse<WechatError & WechatUserInfo>
      = await lastValueFrom(
        this.httpService.get(
          `${this.apiServer}/sns/userinfo?access_token=${this.accessTokenInfo.accessToken}&openid=${this.accessTokenInfo.openid}`,
        ),
      )
    if (result.data.errcode) {
      throw new BadRequestException(
        `[getUserInfo] errcode:${result.data.errcode}, errmsg:${result.data.errmsg}`,
      )
    }
    console.log('result', result.data)

    return result.data
  }

  async getAccessToken(code) {
    const { APPID, APPSECRET } = process.env
    if (!APPSECRET)
      throw new BadRequestException('[getAccessToken]必须有appSecret')

    if (
      !this.accessTokenInfo
      || (this.accessTokenInfo && this.isExpires(this.accessTokenInfo))
    ) {
      // 请求accessToken数据
      const { data }: AxiosResponse<WechatError & AccessConfig, any>
        = await lastValueFrom(
          this.httpService.get(
            `${this.apiServer}/sns/oauth2/access_token?appid=${APPID}&secret=${APPSECRET}&code=${code}&grant_type=authorization_code`,
          ),
        )

      if (data.errcode) {
        throw new BadRequestException(
          `[getAccessToken] errcode:${data.errcode}, errmsg:${data.errmsg}`,
        )
      }
      this.accessTokenInfo = {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        getTime: Date.now(),
        openid: data.openid,
      }
    }

    return this.accessTokenInfo.accessToken
  }

  /**
   * 微信小程序 通过 code 换取 openid
   */
  async code2Session(code: string) {
    const { MINI_APPID, MINI_APPSECRET } = process.env
    const { data }: AxiosResponse<WechatError & AccessConfig, any> = await lastValueFrom(
      this.httpService.get(
        `${this.apiServer}/sns/jscode2session?appid=${MINI_APPID}&secret=${MINI_APPSECRET}&js_code=${code}&grant_type=authorization_code`,
      ),
    )

    if (data.errcode) {
      throw new BadRequestException(
        `[code2Session] errcode:${data.errcode}, errmsg:${data.errmsg}`,
      )
    }
    let user = {}
    if (data.openid)
      user = await this.getUserByOpenid(data.openid)

    return { ...data, ...user }
  }

  /** 获取小程序 access token */
  async getMiniAccessToken() {
    if (!this.miniAccessTokenInfo || (this.miniAccessTokenInfo && this.isExpires(this.miniAccessTokenInfo))) {
      const { MINI_APPID, MINI_APPSECRET } = process.env
      const { data }: AxiosResponse<WechatError & AccessConfig, any> = await lastValueFrom(
        this.httpService.get(
          `${this.apiServer}/cgi-bin/token?grant_type=client_credential&appid=${MINI_APPID}&secret=${MINI_APPSECRET}`,
        ),
      )

      if (data.errcode) {
        throw new BadRequestException(
          `[getAccessToken] errcode:${data.errcode}, errmsg:${data.errmsg}`,
        )
      }

      this.miniAccessTokenInfo = {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        getTime: Date.now(),
        openid: data.openid,
      }
    }

    return this.miniAccessTokenInfo.accessToken
  }

  /** 获取 小程序二维码 */
  async getUnlimitedMiniQRCode({ scene, page, envVersion }: WechatMiniQRCodeCreateDto) {
    const accessToken = await this.getMiniAccessToken()

    const { data }: AxiosResponse<WechatError & AccessConfig, any> = await lastValueFrom(
      this.httpService.post(
        `${this.apiServer}/wxa/getwxacodeunlimit?access_token=${accessToken}`,
        { scene, page, env_version: envVersion },
        { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, responseType: 'arraybuffer' },
      ),
    )

    return `data:image/png;base64,${(data as unknown as Buffer).toString('base64')}`
  }

  async loginWithWechatMini({ openid, avatar, nickname }: WechatMiniOAuth2Info) {
    const user = await this.getUserByOpenid(openid)
    if (!user)
      return this.userService.registerByWechat({ openid, headimgurl: avatar, nickname })

    return this.login(user)
  }

  isExpires(access) {
    return Date.now() - access.getTime > access.expiresIn * 1000
  }
}
