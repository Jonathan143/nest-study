import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import * as urlencode from 'urlencode'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { Socket } from 'socket.io'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { WechatLoginDto, WechatOAuth2Dto } from './dto/wechat-login.dto'
import { NoAuth } from '@/core/decorator/customize'
import { SocketGateway } from '@/socket/socket.gateway'

@ApiTags('验证')
@Controller('auth')
export class AuthController {
  socketServe: Socket
  configService: ConfigService

  constructor(
    private readonly authService: AuthService,
    private readonly ws: SocketGateway,
    private readonly config: ConfigService,
  ) {
    this.configService = config
  }

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
    const redirectUri = urlencode(`${this.configService.get('SERVE_URL')}/api/auth/wechat`)
    this.ws.server.to(query.socketId).emit('wechatLogin', { state: 1, message: '扫码成功' })

    res.redirect(
      `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${query.socketId}#wechat_redirect`,
    )
  }

  @ApiOperation({ summary: '微信登录' })
  @ApiBody({ type: WechatLoginDto, required: true })
  @NoAuth()
  @Get('wechat')
  async loginWithWechat(@Query() query: WechatLoginDto) {
    const { state, code } = query

    const userInfo = await this.authService.loginWithWechat(code)
    this.ws.server.to(state).emit('wechatLogin', { state: 2, message: '登录成功', userInfo })
    return userInfo
  }

  @ApiOperation({ summary: '微信登录' })
  @ApiBody({ type: WechatLoginDto, required: true })
  @NoAuth()
  @Post('wechat')
  async loginWithWechat2(@Body() body: WechatLoginDto) {
    return this.authService.loginWithWechat(body.code)
  }
}
