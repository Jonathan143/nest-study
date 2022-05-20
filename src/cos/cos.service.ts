import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as tencentcloud from 'tencentcloud-sdk-nodejs'
import { PurgeUrlsCacheRequest } from 'tencentcloud-sdk-nodejs/src/services/cdn/v20180606/cdn_models'
import STS = require('qcloud-cos-sts')

// 导入对应产品模块的client models。
const CdnClient = tencentcloud.cdn.v20180606.Client

@Injectable()
export class CosService {
  configService: ConfigService
  secretId: string
  secretKey: string
  cdnClient: InstanceType<typeof CdnClient>

  constructor(
    configService: ConfigService,
  ) {
    this.configService = configService
    this.secretId = this.configService.get('COS_SECRECT_ID')
    this.secretKey = this.configService.get('COS_SECRECT_KEY')

    const clientConfig = {
      credential: {
        secretId: this.secretId,
        secretKey: this.secretKey,
      },
      region: '',
      profile: {
        httpProfile: {
          endpoint: 'cdn.tencentcloudapi.com',
        },
      },
    }
    this.cdnClient = new CdnClient(clientConfig)
  }

  getSTSConfig({ bucket = '', region = '', allowPrefix = '*' }) {
    return {
      secretId: this.secretId,
      secretKey: this.secretKey,
      proxy: '',
      durationSeconds: 1800,

      // 放行判断相关参数
      bucket: bucket || this.configService.get('COS_BUCKET'),
      region,
      allowPrefix,
      allowActions: [
        'name/cos:GetService',
        'name/cos:GetBucket',
        'name/cos:GetObject',
        // 简单上传
        'name/cos:PutObject',
        'name/cos:PostObject',
        // 分片上传
        'name/cos:ListMultipartUploads',
        'name/cos:InitiateMultipartUpload',
        'name/cos:ListParts',
        'name/cos:UploadPart',
        'name/cos:CompleteMultipartUpload',
        // 删除
        'name/cos:DeleteObject',
      ],
    }
  }

  async getAuthorization({ bucket: qBucket }) {
    const {
      bucket,
      allowActions,
      region,
      allowPrefix,
      secretId,
      secretKey,
      proxy,
      durationSeconds,
    } = this.getSTSConfig({ bucket: qBucket })
    const shortBucketName = bucket.substring(0, bucket.lastIndexOf('-'))
    const appId = bucket.substring(1 + bucket.lastIndexOf('-'))
    const policy = {
      version: '2.0',
      statement: [
        {
          action: allowActions,
          effect: 'allow',
          principal: { qcs: ['*'] },
          resource: [
            `qcs::cos:${
              region
            }:uid/${
              appId
            }:prefix//${
              appId
            }/${
              shortBucketName
            }/${
              allowPrefix}`,
          ],
        },
      ],
    }

    return new Promise((resolve, reject) => {
      STS.getCredential(
        {
          secretId,
          secretKey,
          proxy,
          durationSeconds,
          policy,
        },
        (err, tempKeys) => {
          const result = err || tempKeys
          console.log(result)
          resolve(result)
        },
      )
    })
  }

  async refreshCDNCache(params: PurgeUrlsCacheRequest) {
    return this.cdnClient.PurgeUrlsCache(params)
  }
}
