import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CosService } from './cos.service'
import { NoAuth } from '@/core/decorator/customize'

@ApiTags('cos')
@Controller('cos')
export class CosController {
  constructor(private readonly cosService: CosService) {}

  @Get('auth')
  @NoAuth()
  // @ApiBearerAuth()
  @ApiOperation({ summary: '获取COS临时密钥' })
  getAuthorization(@Query('bucket')bucket: string) {
    return this.cosService.getAuthorization({ bucket })
  }
}
