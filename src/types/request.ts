interface BaseRequestConfig {
  headers?: {
    isToken?: boolean
    isEncrypt?: boolean
    repeatSubmit?: boolean
  }
  header?: Record<string, any>
  url: string
  params?: any
  timeout?: number
}

export interface RequestConfig extends BaseRequestConfig {
  method?: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'options' | 'get' | 'head' | 'post' | 'put' | 'delete' | 'connect'
  baseUrl?: string
  data?: any
}

export interface RequestUploadConfig extends BaseRequestConfig {
  filePath: string
  name?: string
  formData: any
}

export interface ResponseData<T> {
  code: number
  data: any
  msg: string
  imgUrl: string
  total: number
  rows: Array<T>
}
