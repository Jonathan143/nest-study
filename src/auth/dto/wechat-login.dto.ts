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

export class WechatMiniOAuth2Dto {
  @ApiProperty({ description: '连接码' })
  @IsNotEmpty({ message: '连接码不能为空' })
    socketId: string

  @ApiProperty({ description: 'openid' })
  @IsNotEmpty({ message: 'openid不能为空' })
    openid: string

  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名不能为空' })
    nickname: string

  @ApiProperty({ description: '头像' })
  @IsNotEmpty({ message: '头像不能为空' })
    avatar: string
}

export class WechatMiniLoginDto {
  @ApiProperty({ description: '授权码' })
  @IsNotEmpty({ message: '请输入授权码' })
    code: string
}

export class WechatMiniQRCodeCreateDto {
  @ApiProperty({ description: '参数' })
  @IsNotEmpty()
    scene: string

  @ApiProperty({ description: '页面 page，例如 pages/index/index，根路径前不要填加 /' })
    page: string

  @ApiProperty({ description: '要打开的小程序版本。正式版为 release，体验版为 trial，开发版为 develop' })
    envVersion: string
}
