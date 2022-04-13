import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { CategoryEntity } from './entities/category.entity'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(name: string) {
    return await this.categoryRepository.save({ name })
  }

  async findById(id) {
    return await this.categoryRepository.findOne(id)
  }
}
