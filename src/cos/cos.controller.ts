import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { NestCacheApi } from 'nest-redis-cache'
import { CosService } from './cos.service'
import { NoAuth } from '@/core/decorator/customize'

@ApiTags('cos')
@Controller('cos')
export class CosController {
  constructor(private readonly cosService: CosService) {}

  @Get('auth')
  @NoAuth()
  // @ApiBearerAuth()
  @NestCacheApi({
    exSecond: 25 * 60,
    key: process.env.COS_BUCKET,
    formatKey: (key, request) => (`cos_auth_${request.query?.bucket || key}`),
  })
  @ApiOperation({ summary: '获取COS临时密钥' })
  getAuthorization(@Query('bucket')bucket: string) {
    return this.cosService.getAuthorization({ bucket })
  }
}
