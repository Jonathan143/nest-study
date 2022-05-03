import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { NestApiCacheModule } from 'nest-redis-cache'
import envConfig from '../config/env'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PostsModule } from './posts/posts.module'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { CategoryModule } from './category/category.module'
import { TagModule } from './tag/tag.module'
import { CosModule } from './cos/cos.module'
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard'
import { RolesGuard } from '@/auth/guard/role.guard'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath: [envConfig.path] }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async(configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', '127.0.0.1'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASSWORD', 'root'),
        database: configService.get('DB_DATABASE', 'blog'),
        // charset: 'utf8mb4',
        timezone: '+08:00',
        // 根据实体自动创建数据库表，生产环境建议关闭
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    /** 默认一分钟缓存1分钟 */
    NestApiCacheModule.forRoot({
      redisConfig: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
      },
      redisEXSecond: 60,
    }),
    PostsModule,
    UserModule,
    AuthModule,
    CategoryModule,
    TagModule,
    CosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})

export class AppModule {}
