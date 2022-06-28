import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { NestCacheApi } from 'nest-redis-cache'
import { PostsService } from './posts.service'
import { CreatePostDto, PostsRo, TheMovieDBDto } from './dto/post.dto'
import { NoAuth, Roles } from '@/core/decorator/customize'

@ApiTags('文章')
@Controller('post')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  /**
   * 创建文章
   */
  @ApiOperation({ summary: '创建文章' })
  @ApiBearerAuth()
  @Post()
  @Roles('root')
  async create(@Body() post: CreatePostDto, @Req() req) {
    return await this.postsService.create(req.user, post)
  }

  /**
   * the movie db
   * @param body
   * @returns
   */
  @ApiOperation({ summary: 'the movie db' })
  @NoAuth()
  @NestCacheApi({
    exSecond: 6 * 60 * 60,
    key: '',
    formatKey: (key, request) => (`movie_db_${request.body?.api || key}_${request.body?.params?.page || ''}`),
  })
  @Post('/movie_db')
  async getMovieDB(@Body() body: TheMovieDBDto) {
    return await this.postsService.theMovieDBApi(body)
  }

  /**
   * 获取所有文章
   */
  @ApiOperation({ summary: '获取文章列表' })
  @NoAuth()
  @Get('/list')
  async findAll(
    @Query() query,
    @Query('pageSize') pageSize: number,
    @Query('pageNum') pageNum: number,
  ): Promise<PostsRo> {
    return await this.postsService.findAll(query)
  }

  /**
   * 获取归档列表
   */
  @ApiOperation({ summary: '归档日期列表' })
  @NoAuth()
  @Get('/archives')
  getArchives() {
    return this.postsService.getArchives()
  }

  /**
   * 获取文章归档
   */
  @ApiOperation({ summary: '文章归档' })
  @NoAuth()
  @Get('/archives/list')
  getArchiveList(@Query('time') time: string) {
    return this.postsService.getArchiveList(time)
  }

  /**
   * 获取指定文章
   * @param id
   */
  @ApiOperation({ summary: '获取指定文章' })
  @NoAuth()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.postsService.findById(id)
  }

  /**
   * 更新文章
   * @param id
   * @param post
   */
  @ApiOperation({ summary: '更新指定文章' })
  @ApiBearerAuth()
  @Put(':id')
  async update(@Param('id') id: number, @Body() post: CreatePostDto) {
    return await this.postsService.updateById(id, post)
  }

  /**
   * 删除
   * @param id
   */
  @ApiOperation({ summary: '删除文章' })
  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id') id) {
    return await this.postsService.remove(id)
  }
}
