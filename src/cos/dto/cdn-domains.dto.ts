import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CDNDomainsDTO {
  @ApiProperty({ description: '存储桶', example: [''] })
  @IsNotEmpty()
    bucket: string

  @ApiProperty({ description: '区域', example: 'ap-shanghai' })
  @IsNotEmpty()
    region: string
}
