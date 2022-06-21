import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  Res,
  UseGuards, UseInterceptors,
} from '@nestjs/common'
import * as urlencode from 'urlencode'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { Socket } from 'socket.io'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { WechatLoginDto, WechatMiniLoginDto, WechatMiniOAuth2Dto, WechatMiniQRCodeCreateDto, WechatOAuth2Dto } from './dto/wechat-login.dto'
import { NoAuth } from '@/core/decorator/customize'
import { SocketGateway } from '@/socket/socket.gateway'

@ApiTags('验证')
@Controller('auth')
export class AuthController {
  socketServe: Socket
  // configService: ConfigService

  constructor(
    private readonly authService: AuthService,
    private readonly ws: SocketGateway,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: '登录' })
  @NoAuth()
  @UseGuards(AuthGuard('local'))
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() user: LoginDto, @Req() req) {
    return await this.authService.login(req.user)
  }

  @ApiOperation({ summary: '微信登录跳转' })
  @NoAuth()
  @Get('wechatOAuth2')
  async wechatLogin(@Query() query: WechatOAuth2Dto, @Res() res: Response) {
    const APPID = process.env.APPID
    const redirectUri = urlencode(`${this.configService.get('SERVER_URL')}/api/auth/wechat`)

    this.ws.server.to(query.socketId).emit('wechatLogin', { state: 1, message: '扫码成功' })

    res.redirect(
      `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${query.socketId}#wechat_redirect`,
    )
  }

  @ApiOperation({ summary: '微信登录' })
  @NoAuth()
  @Get('wechat')
  async loginWithWechat(@Query() query: WechatLoginDto, @Res() res: Response) {
    const { state, code } = query

    const userInfo = await this.authService.loginWithWechat(code)
    this.ws.server.to(state).emit('wechatLogin', { state: 2, message: '登录成功', userInfo })

    res.redirect(
      `${this.configService.get('WEB_URL')}/#/result-page?status=success&title=登录成功&hiddenButton=1`,
    )
  }

  @ApiOperation({ summary: '微信登录' })
  @ApiBody({ type: WechatLoginDto, required: true })
  @NoAuth()
  @Post('wechat')
  async loginWithWechat2(@Body() body: WechatLoginDto) {
    return this.authService.loginWithWechat(body.code)
  }

  @ApiOperation({ summary: '微信小程序code2Session' })
  @ApiBody({ type: WechatMiniLoginDto, required: true })
  @NoAuth()
  @Post('wechat_mini_code2Session')
  async code2Session(@Body() body: WechatMiniLoginDto) {
    return this.authService.code2Session(body.code)
  }

  @ApiOperation({ summary: '微信小程序二维码获取' })
  @NoAuth()
  @Get('wechat_mini_qrcode')
  async miniAccesstoken(@Query() query: WechatMiniQRCodeCreateDto) {
    return this.authService.getUnlimitedMiniQRCode(query)
  }

  @ApiOperation({ summary: '更新扫码登录状态' })
  @NoAuth()
  @Get('wechat_mini_updateScanCodeState')
  async miniUpdateScanCodeState(@Query() query: WechatMiniLoginDto) {
    this.ws.server.to(query.code).emit('wechatLogin', { state: 1, message: '扫码成功' })

    return 'success'
  }

  @ApiOperation({ summary: '微信小程序授权登录' })
  @ApiBody({ type: WechatMiniOAuth2Dto, required: true })
  @NoAuth()
  @Post('wechat_mini_OAuth2')
  async loginWithWechatMini(@Body() body: WechatMiniOAuth2Dto) {
    const { socketId } = body

    const userInfo = await this.authService.loginWithWechatMini(body)
    this.ws.server.to(socketId).emit('wechatLogin', { state: 2, message: '登录成功', userInfo })

    return { ...body, ...userInfo }
  }
}
