import { compareSync } from 'bcryptjs'
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { WechatUserInfo } from '../auth/auth.interface'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 账号密码注册
   * @param createUser
   */
  async register(createUser: CreateUserDto) {
    const { username } = createUser

    const user = await this.userRepository.findOne({
      where: { username },
    })
    if (user)
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST)

    const newUser = await this.userRepository.create(createUser)
    return await this.userRepository.save(newUser)
  }

  async registerByWechat(userInfo: WechatUserInfo) {
    const { nickname, openid, headimgurl } = userInfo
    const newUser = await this.userRepository.create({
      username: nickname,
      nickname,
      openid,
      avatar: headimgurl,
    })
    return await this.userRepository.save(newUser)
  }

  findAll() {
    return 'This action returns all user'
  }

  async findOne(id) {
    return await this.userRepository.findOne({ where: { id } })
  }

  async findByOpenid(openid: string) {
    return await this.userRepository.findOne({ where: { openid } })
  }

  async update(id: string, updateUser: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user)
      throw new HttpException('用户名不存在', HttpStatus.BAD_REQUEST)

    const { newPassword, password } = updateUser
    if (newPassword && password) {
      const isPassed = !user.password || this.comparePassword(password, user.password)
      if (!isPassed)
        throw new HttpException('密码错误', HttpStatus.BAD_REQUEST)

      updateUser.password = await bcrypt.hashSync(updateUser.newPassword, 10)
      delete updateUser.newPassword
    }
    else {
      delete updateUser.password
    }
    updateUser.updateTime = new Date()
    const { affected } = await this.userRepository.update(user.id, updateUser)

    if (affected)
      return await this.userRepository.findOne({ where: { id } })
    throw new HttpException('更新失败', HttpStatus.INTERNAL_SERVER_ERROR)
  }

  remove(id: string) {
    return `This action removes a #${id} user`
  }

  comparePassword(password, libPassword) {
    return compareSync(password, libPassword)
  }
}
