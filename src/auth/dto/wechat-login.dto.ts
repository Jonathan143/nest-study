import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class WechatLoginDto {
  @ApiProperty({ description: '授权码' })
  @IsNotEmpty({ message: '请输入授权码' })
    code: string

  @ApiProperty({ description: '连接码' })
  @IsNotEmpty({ message: '连接码不能为空' })
    state: string
}

export class WechatOAuth2Dto {
  @ApiProperty({ description: '连接码' })
  @IsNotEmpty({ message: '连接码不能为空' })
    socketId: string
}
