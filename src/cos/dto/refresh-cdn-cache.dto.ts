import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayNotEmpty } from 'class-validator'

export class RefreshCDNCacheDTO {
  @ApiProperty({ description: '链接列表', example: ['https://test.com/test.png'] })
  @ArrayMaxSize(1000)
  @ArrayNotEmpty()
    urlList: string[]
}
