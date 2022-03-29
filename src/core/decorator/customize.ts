import { SetMetadata } from '@nestjs/common'
import { RoleItem } from '@/user/entities/user.entity'

export const NoAuth = () => SetMetadata('no-auth', true)

export const Roles = (...roles: RoleItem[]) => SetMetadata('roles', roles)
