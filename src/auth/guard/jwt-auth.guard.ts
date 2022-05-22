import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard, IAuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { User } from '@/user/entities/user.entity'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext) {
    const noAuth = this.reflector.get<boolean>('no-auth', context.getHandler())
    if (noAuth) return true

    const res = this.getRequest(context) as Request
    const token = res.headers.authorization
    this.verifyToken(token)

    const guard = new (AuthGuard('jwt'))()
    return guard.canActivate(context) //  执行所选策略Guard的canActivate方法
  }

  getRequest(context: ExecutionContext) {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest()
    return request
  }

  throwUnAuth() {
    throw new UnauthorizedException('身份验证失败')
  }

  verifyToken(token: string): User {
    if (!token) this.throwUnAuth()

    try {
      const user = this.jwtService.verify(token.replace('Bearer ', ''), { secret: process.env.SECRET })
      return user
    }
    catch (error) {
      if (error.message.includes('expired')) throw new ForbiddenException('用户身份过期，请重新登录')

      this.throwUnAuth()
    }
  }

  handleRequest<User>(err, user: User): User {
    if (err || !user)
      throw new UnauthorizedException('身份验证失败')

    return user
  }
}
