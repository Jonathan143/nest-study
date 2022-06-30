import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post, Req,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserInfoResponse } from './dto/user-info.dto'
import { NoAuth, Roles } from '@/core/decorator/customize'

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '注册用户' })
  @ApiResponse({ status: 201, type: UserInfoResponse })
  @UseInterceptors(ClassSerializerInterceptor)
  @NoAuth()
  @Post('register')
  register(@Body() createUser: CreateUserDto) {
    return this.userService.register(createUser)
  }

  @ApiOperation({ summary: '获取用户信息' })
  @ApiBearerAuth()
  @Get()
  async getUserInfo(@Req() req) {
    return req.user
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id)
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req) {
    if (req.user.id !== id && req.user.role !== 'admin')
     throw new HttpException('无权限', HttpStatus.UNAUTHORIZED)

    return this.userService.update(id, updateUserDto)
  }

  @Delete(':id')
  @Roles('root')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.userService.remove(id)
  }
}
