import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { NestCacheApi } from 'nest-redis-cache'
import { arrayNotEmpty } from 'class-validator'
import { CosService } from './cos.service'
import { RefreshCDNCache } from './dot/refresh-cdn-cache.dot'
import { NoAuth } from '@/core/decorator/customize'

@ApiTags('cos')
@Controller('cos')
export class CosController {
  constructor(private readonly cosService: CosService) {}

  @Get('auth')
  @ApiBearerAuth()
  @NestCacheApi({
    exSecond: 25 * 60,
    key: process.env.COS_BUCKET,
    formatKey: (key, request) => (`cos_auth_${request.query?.bucket || key}`),
  })
  @ApiOperation({ summary: '获取COS临时密钥' })
  getAuthorization(@Query('bucket')bucket: string) {
    return this.cosService.getAuthorization({ bucket })
  }

  @Post('refreshCDNCache')
  @ApiBearerAuth()
  @ApiOperation({ summary: '刷新根据链接CDN缓存' })
  refreshCDNCache(@Body() body: RefreshCDNCache) {
    return this.cosService.refreshCDNCache({ Urls: body.urlList })
  }
}
