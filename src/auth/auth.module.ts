import { Global, Module, forwardRef } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UserModule } from 'src/user/user.module'
import { HttpModule } from '@nestjs/axios'
import { LocalStorage } from './local.strategy'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStorage } from './jwt.strategy'

const jwtModule = JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: async(configService: ConfigService) => {
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
  exports: [jwtModule, AuthService],
})
export class AuthModule {}
