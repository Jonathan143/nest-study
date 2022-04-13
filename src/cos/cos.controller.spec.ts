import { Test, TestingModule } from '@nestjs/testing';
import { CosController } from './cos.controller';

describe('CosController', () => {
  let controller: CosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CosController],
    }).compile();

    controller = module.get<CosController>(CosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
