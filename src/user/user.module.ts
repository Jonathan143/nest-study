import { TypeOrmModule } from '@nestjs/typeorm'
import { Module, forwardRef } from '@nestjs/common'
import { User } from './entities/user.entity'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { AuthModule } from '@/auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
