import { Module } from '@nestjs/common'
import { CosService } from './cos.service'
import { CosController } from './cos.controller'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [CosService],
  controllers: [CosController],
})
export class CosModule {}
