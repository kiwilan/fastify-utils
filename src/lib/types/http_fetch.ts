import type { FetchContext, FetchOptions, FetchResponse } from 'ofetch'

export type ResponseMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
export type FetchType = 'text' | 'json' | 'unknown'
export interface RequestParams {
  [key: string]: string | number | boolean | undefined
}
export interface RequestBody {
  [key: string]: any
}
export type AcceptType = 'application/json' | 'text/plain' | 'text/html' | 'application/octet-stream'
export type Response<T> = void | FetchResponse<T>
export type Ctx = FetchContext<any> & {
  error: Error
}

export interface FetchableClient {
  url: string
  method?: ResponseMethod
  accept?: AcceptType
  params?: RequestParams
  body?: RequestBody
}
export interface FetchableParams {
  url: string
  method?: ResponseMethod
  accept?: AcceptType
  urlParams?: RequestParams
  queryParams?: RequestParams
  body?: RequestBody
}
export interface FetchableOptions extends FetchOptions<'json'> {
}

export interface Get {
  endpoint: string
  urlParams?: RequestParams
  queryParams?: RequestParams
}
export interface Post {
  endpoint: string
  urlParams?: RequestParams
  queryParams?: RequestParams
  body?: RequestBody
}

export interface URLParams {
  url: string
  baseURL?: string
  urlParams?: RequestParams
  queryParams?: RequestParams
}
