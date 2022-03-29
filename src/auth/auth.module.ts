import { JwtStorage } from './jwt.strategy'
import { Module, forwardRef, Global } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LocalStorage } from './local.strategy'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UserModule } from 'src/user/user.module'
import { HttpModule } from '@nestjs/axios'

const jwtModule = JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    return {
      secret: configService.get('SECRET'),
      signOptions: { expiresIn: '4h' },
    }
  },
})

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    HttpModule,
    PassportModule,
    jwtModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStorage, JwtStorage],
  exports: [jwtModule],
})
export class AuthModule {}
