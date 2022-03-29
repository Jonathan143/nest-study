import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  Length,
  IsEmail,
  IsOptional,
  IsUrl,
  IsIn,
} from 'class-validator'
import { roles } from '../entities/user.entity'

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '请输入用户名' })
  @Length(2, 100, { message: '用户名长度为2-100字符' })
  username: string

  @ApiProperty({ description: '密码' })
  @IsNotEmpty({ message: '请输入密码' })
  password: string

  @ApiProperty({ description: '用户角色', default: 'visitor' })
  @IsIn(roles, { message: '用户权限配置错误' })
  role: string

  @ApiProperty({ description: '用户邮箱', default: 'test@email.com' })
  @IsOptional()
  @IsEmail()
  email: string

  @ApiProperty({
    description: '用户头像',
    default: 'https://test.com/avatar.png',
  })
  @IsOptional()
  @IsUrl()
  avatar: string
}
