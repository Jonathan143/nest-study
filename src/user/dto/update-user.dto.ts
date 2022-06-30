import { ApiProperty, PartialType } from '@nestjs/swagger'
import { UserInfoDto } from './user-info.dto'

export class UpdateUserDto extends PartialType(UserInfoDto) {
  @ApiProperty({ description: '旧密码' })
  password: string

  @ApiProperty({ description: '新密码' })
  newPassword: string
}
