import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom } from 'rxjs'
import { CategoryService } from './../category/category.service'
import { CreatePostDto, PostInfoDto, PostsRo } from './dto/post.dto'
import { PostsEntity } from './posts.entity'
import { TagService } from './../tag/tag.service'

@Injectable()
export class PostsService {
  moveDBApiKey = process.env.THE_MOVIE_DB_APIKEY

  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private httpService: HttpService,
  ) { }

  async create(user, post: CreatePostDto): Promise<number> {
    const { title } = post
    if (!title)
      throw new HttpException('缺少文章标题', HttpStatus.BAD_REQUEST)

    const doc = await this.postsRepository.findOne({
      where: { title },
    })
    if (doc)
      throw new HttpException('文章已存在', HttpStatus.BAD_REQUEST)

    const { tag, category = 0, status, isRecommend, coverUrl } = post

    const categoryDoc = await this.categoryService.findById(category)

    const tags = await this.tagService.findByIds((`${tag}`).split(','))
    const postParam: Partial<PostsEntity> = {
      ...post,
      isRecommend: isRecommend ? 1 : 0,
      category: categoryDoc,
      tags,
      author: user,
    }
    if (status === 'publish') {
      Object.assign(postParam, {
        publishTime: new Date(),
      })
    }

    const newPost: PostsEntity = await this.postsRepository.create({
      ...postParam,
    })
    const created = await this.postsRepository.save(newPost)
    return created.id
  }

  async findAll(query): Promise<PostsRo> {
    const qb = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.author', 'user')
      .orderBy('post.updateTime', 'DESC')
    qb.where('1 = 1')
    qb.orderBy('post.create_time', 'DESC')

    const count = await qb.getCount()
    const { pageNum = 1, pageSize = 10, ...params } = query
    qb.limit(pageSize)
    qb.offset(pageSize * (pageNum - 1))

    const posts = await qb.getMany()
    const result: PostInfoDto[] = posts.map(item => item.toResponseObject())
    return { list: result, count }

    //  使用find 方式实现
    /**
     const { pageNum = 1, pageSize = 10, ...params } = query;
    const result = await this.postsRepository.findAndCount({
      relations: ['category', 'author', "tags"],
      order: {
        id: 'DESC',
      },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });
    const list = result[0].map((item) => item.toResponseObject());
    return { list, count: result[1] };
     */
  }

  async findById(id): Promise<any> {
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.author', 'user')
      .where('post.id=:id')
      .setParameter('id', id)

    const result = await qb.getOne()
    if (!result)
      throw new HttpException(`id为${id}的文章不存在`, HttpStatus.BAD_REQUEST)
    await this.postsRepository.update(id, { count: result.count + 1 })

    return result.toResponseObject()
  }

  async updateById(id, post): Promise<number> {
    const existPost = await this.postsRepository.findOne(id)
    if (!existPost)
      throw new HttpException(`id为${id}的文章不存在`, HttpStatus.BAD_REQUEST)

    const { category, tag, status } = post
    const tags = await this.tagService.findByIds((`${tag}`).split(','))
    const categoryDoc = await this.categoryService.findById(category)
    const newPost = {
      ...post,
      isRecommend: post.isRecommend ? 1 : 0,
      category: categoryDoc,
      tags,
      publishTime: status === 'publish' ? new Date() : existPost.publishTime,
    }

    const updatePost = this.postsRepository.merge(existPost, newPost)
    return (await this.postsRepository.save(updatePost)).id
  }

  async updateViewById(id) {
    const post = await this.postsRepository.findOne(id)
    const updatePost = await this.postsRepository.merge(post, {
      count: post.count + 1,
    })
    this.postsRepository.save(updatePost)
  }

  async getArchives() {
    const data = await this.postsRepository
      .createQueryBuilder('post')
      .select(['DATE_FORMAT(update_time, \'%Y年%m\') time', 'COUNT(*) count'])
      .where('status=:status', { status: 'publish' })
      .groupBy('time')
      .orderBy('update_time', 'DESC')
      .getRawMany()
    return data
  }

  async getArchiveList(time) {
    const data = await this.postsRepository
      .createQueryBuilder('post')
      .where('status=:status', { status: 'publish' })
      .andWhere('DATE_FORMAT(update_time, \'%Y年%m\')=:time', { time })
      .orderBy('update_time', 'DESC')
      .getRawMany()
    return data
  }

  async remove(id) {
    const existPost = await this.postsRepository.findOne(id)
    if (!existPost)
      throw new HttpException(`id为${id}的文章不存在`, HttpStatus.BAD_REQUEST)

    return await this.postsRepository.remove(existPost)
  }

  async theMovieDBApi({ api, params = {} }) {
    const { data }: AxiosResponse<any, any> = await lastValueFrom(
      this.httpService.request(
        {
          url: `https://api.themoviedb.org/3${api}`,
          params: { language: 'zh', include_image_language: 'zh,null', ...params },
          headers: { 'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `Bearer ${this.moveDBApiKey}` },
        },
      ),
    )
    return data
  }
}
