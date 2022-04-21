import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { NestCacheApi } from 'nest-api-cache'
import { CosService } from './cos.service'
import { NoAuth } from '@/core/decorator/customize'

@ApiTags('cos')
@Controller('cos')
export class CosController {
  constructor(private readonly cosService: CosService) {}

  @Get('auth')
  @NoAuth()
  // @ApiBearerAuth()
  @NestCacheApi(25 * 60)
  @ApiOperation({ summary: '获取COS临时密钥' })
  getAuthorization(@Query('bucket')bucket: string) {
    return this.cosService.getAuthorization({ bucket })
  }
}
