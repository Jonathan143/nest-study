import { Injectable } from '@nestjs/common'
const STS = require('qcloud-cos-sts')

const getSTSConfig = ({ bucket = '', region = '', allowPrefix = '/*' }) => ({
  secretId: process.env.COS_SECRECT_ID,
  secretKey: process.env.COS_SECRECT_KEY,
  proxy: '',
  durationSeconds: 1800,

  // 放行判断相关参数
  bucket,
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
})

@Injectable()
export class CosService {
  constructor() {}

  async getAuthorization() {
    const {
      bucket,
      allowActions,
      region,
      allowPrefix,
      secretId,
      secretKey,
      proxy,
      durationSeconds,
    } = getSTSConfig({})
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
            'qcs::cos:' +
              region +
              ':uid/' +
              appId +
              ':prefix//' +
              appId +
              '/' +
              shortBucketName +
              '/' +
              allowPrefix,
          ],
        },
      ],
    }

    return new Promise((resolve, reject) => {
      STS.getCredential(
        {
          secretId: secretId,
          secretKey: secretKey,
          proxy,
          durationSeconds,
          policy: policy,
        },
        function (err, tempKeys) {
          const result = err || tempKeys
          console.log(result)
          resolve(result)
        },
      )
    })
  }
}
