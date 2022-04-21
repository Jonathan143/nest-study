import * as fs from 'fs'
import * as path from 'path'
// const dotenv = require('dotenv');
const isProd = process.env.NODE_ENV === 'production'

function parseEnv() {
  const localEnv = path.resolve('.env')
  const localTestEnv = path.resolve('.env.local')
  const prodEnv = path.resolve('.env.prod')
  const hasLocalTestEnv = fs.existsSync(localTestEnv)

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv))
    throw new Error('缺少环境配置文件')

  const filePath = isProd && fs.existsSync(prodEnv) ? prodEnv : hasLocalTestEnv ? localTestEnv : localEnv

  return { path: filePath }
}

export default parseEnv()
