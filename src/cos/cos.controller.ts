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
import { RefreshCDNCacheDTO } from './dto/refresh-cdn-cache.dto'
import { CDNDomainsDTO } from './dto/cdn-domains.dto'
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
  refreshCDNCache(@Body() body: RefreshCDNCacheDTO) {
    return this.cosService.refreshCDNCache({ Urls: body.urlList })
  }

  @Post('cdnDomains')
  @ApiBearerAuth()
  @ApiOperation({ summary: '检索CDN域名' })
  @NestCacheApi({
    exSecond: 12 * 60 * 60,
    formatKey: (key, request) => {
      const { bucket, region } = request.body
      return `cos_cdn_domains_${bucket || key}_${region}`
    },
  })
  getCDNDescribeDomains(@Body() body: CDNDomainsDTO) {
    return this.cosService.getCDNDescribeDomains(body)
  }
}
