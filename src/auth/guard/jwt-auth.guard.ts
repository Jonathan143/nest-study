import {
  Injectable,
  ExecutionContext,
  CanActivate,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard, IAuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'

export const NoAuth = () => SetMetadata('no-auth', true)

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const noAuth = this.reflector.get<boolean>('no-auth', context.getHandler())
    if (noAuth) return true

    const guard = new (AuthGuard('jwt'))()
    return guard.canActivate(context) //  执行所选策略Guard的canActivate方法
  }

  getRequest(context: ExecutionContext) {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest()
    return request
  }

  handleRequest<User>(err, user: User): User {
    if (err || !user) {
      throw new UnauthorizedException('身份验证失败')
    }
    return user
  }
}
