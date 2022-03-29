import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import * as urlencode from 'urlencode'
import { WechatLoginDto } from './dto/wechat-login.dto'
import { NoAuth } from '@/core/decorator/customize'

@ApiTags('验证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '登录' })
  @NoAuth()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() user: LoginDto, @Req() req) {
    return await this.authService.login(req.user)
  }

  @ApiOperation({ summary: '微信登录跳转' })
  @NoAuth()
  @Get('wechatLogin')
  async wechatLogin(@Headers() header, @Res() res) {
    const APPID = process.env.APPID
    const redirectUri = urlencode('https://www.yang143.cn')
    res.redirect(
      `https://open.weixin.qq.com/connect/qrconnect?appid=${APPID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`,
    )
  }

  @ApiOperation({ summary: '微信登录' })
  @ApiBody({ type: WechatLoginDto, required: true })
  @NoAuth()
  @Post('wechat')
  async loginWithWechat(@Body('code') code: string) {
    return this.authService.loginWithWechat(code)
  }
}
