import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty } from 'class-validator'

export class RefreshCDNCache {
  @ApiProperty({ description: '链接列表' })
  @ArrayNotEmpty()
    urlList: string[]
}
