import { NoAuth } from '@/core/decorator/customize'
import { Controller, Get } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CosService } from './cos.service'

@ApiTags('cos')
@Controller('cos')
export class CosController {
  constructor(private readonly cosService: CosService) {}

  @Get('auth')
  @NoAuth()
  // @ApiBearerAuth()
  @ApiOperation({ summary: '获取COS临时密钥' })
  getAuthorization() {
    return this.cosService.getAuthorization()
  }
}
