import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import STS = require('qcloud-cos-sts')

@Injectable()
export class CosService {
  configService
  constructor(
    configService: ConfigService,
  ) {
    this.configService = configService
  }

  getSTSConfig({ bucket = '', region = '', allowPrefix = '*' }) {
    return {
      secretId: this.configService.get('COS_SECRECT_ID'),
      secretKey: this.configService.get('COS_SECRECT_KEY'),
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
        'name/cos:ListMultipartUploads',
        'name/cos:ListParts',
        'name/cos:UploadPart',
        'name/cos:CompleteMultipartUpload',
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
}
