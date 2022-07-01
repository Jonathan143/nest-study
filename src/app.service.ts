import { Injectable } from '@nestjs/common'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { HttpService } from '@nestjs/axios'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  getHello(): string {
    console.log('哈哈哈')
    return 'Hello World!'
  }

  async proxy(options: AxiosRequestConfig) {
    const { data }: AxiosResponse<any, any> = await lastValueFrom(
      this.httpService.request(options),
    )
    return data
  }
}
