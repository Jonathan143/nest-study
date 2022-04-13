import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { CosService } from './cos.service'
import { CosController } from './cos.controller'

@Module({
  imports: [HttpModule],
  providers: [CosService],
  controllers: [CosController],
})
export class CosModule {}
