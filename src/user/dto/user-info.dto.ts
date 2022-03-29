import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UserInfoDto {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty()
  username: string

  @ApiProperty({ description: '用户昵称' })
  nickname: string

  @ApiProperty({ description: '用户头像' })
  avatar: string

  @ApiProperty({ description: '用户邮箱' })
  email: string

  @ApiProperty({ description: '角色' })
  role: string

  @ApiProperty({ description: '创建时间' })
  createTime: Date
}

export class UserInfoResponse {
  @ApiProperty({ description: '状态码', example: 0 })
  code: number

  @ApiProperty({
    description: '数据',
    type: () => UserInfoDto,
    example: UserInfoDto,
  })
  data: UserInfoDto

  @ApiProperty({ description: '请求结果信息', example: '请求成功' })
  message: string
}
