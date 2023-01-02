import type { FetchContext, FetchOptions, FetchResponse } from 'ofetch'
import { $fetch } from 'ofetch'
import HttpResponse from './HttpResponse'

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

interface Get {
  endpoint: string
  urlParams?: RequestParams
  queryParams?: RequestParams
}
interface Post {
  endpoint: string
  urlParams?: RequestParams
  queryParams?: RequestParams
  body?: RequestBody
}

interface URLParams {
  url: string
  baseURL?: string
  urlParams?: RequestParams
  queryParams?: RequestParams
}

export default class Http {
  protected constructor(
    protected options: FetchableOptions,
    protected ctx?: Ctx,
  ) {}

  public static client(options?: FetchableOptions): Http {
    const http = new Http(options || {})

    return http
  }

  public async get<T>(params: Get | string): Promise<HttpResponse<T>> {
    return await this.getTypeParams(params, 'GET')
  }

  public async post<T>(params: Post | string): Promise<HttpResponse<T>> {
    return await this.getTypeParams(params, 'POST')
  }

  public async patch<T>(params: Post | string): Promise<HttpResponse<T>> {
    return await this.getTypeParams(params, 'PATCH')
  }

  public async put<T>(params: Post | string): Promise<HttpResponse<T>> {
    return await this.getTypeParams(params, 'PUT')
  }

  public async delete<T>(params: Get | string): Promise<HttpResponse<T>> {
    return await this.getTypeParams(params, 'DELETE')
  }

  private async getTypeParams<T>(params: Get | Post | string, method: ResponseMethod): Promise<HttpResponse<T>> {
    let options: FetchableParams
    if (typeof params !== 'string') {
      const p = params
      options = {
        url: p.endpoint,
        method,
        urlParams: p.urlParams,
        queryParams: p.queryParams,
        // @ts-expect-error `body` is not allowed in `GET` request
        body: p.body || undefined,
      }
    }
    else {
      options = {
        url: params,
        method,
      }
    }

    return await this.fetch<T>(options)
  }

  /**
   * Fetch URL with `fetch` API, handle errors.
   */
  public async fetch<T>(params: FetchableParams | string): Promise<HttpResponse<T>> {
    if (typeof params === 'string') {
      params = {
        url: params,
      }
    }

    const url = this.setUrl({
      url: params.url,
      baseURL: this.options.baseURL,
      urlParams: params.urlParams,
      queryParams: params.queryParams,
    })
    const options = this.mergeOptions(params)

    const res = await $fetch.raw(url, options)
      .catch(() => undefined)

    const response = HttpResponse.make<T>({
      res,
      ctx: this.ctx,
      params,
      options,
    })

    return response
  }

  public async native<T>(url: string, params: FetchableOptions): Promise<HttpResponse<T>> {
    this.options = {
      ...this.options,
      ...params,
    }

    const res = await $fetch.raw(url, this.options)
      .catch(() => {})

    const response = HttpResponse.make<T>({
      options: this.options,
      res,
      params: undefined,
      ctx: this.ctx,
    })

    return response
  }

  private setUrl(params: URLParams): string {
    let url = params.url
    const baseURL = params.baseURL
    const urlParams = params.urlParams
    const queryParams = params.queryParams

    url = url.trim()

    if (urlParams) {
      const urlParamsFormat: string[] = []
      Object.keys(urlParams).forEach((key) => {
        const value = urlParams[key]
        if (value !== undefined)
          urlParamsFormat.push(value.toString())
      })

      urlParamsFormat.forEach((param) => {
        url += `/${param}`
      })
    }

    if (queryParams) {
      const queryParamsFormat = new URLSearchParams()
      Object.keys(queryParams).forEach((key) => {
        const value = queryParams[key]
        if (value !== undefined)
          queryParamsFormat.append(key, value.toString())
      })
      queryParamsFormat.toString()

      url = `${url}?${queryParamsFormat.toString()}`
    }

    if (baseURL)
      url = `${baseURL}${url}`

    return url
  }

  private mergeOptions(options: FetchableParams): FetchableOptions {
    const clientOptions = { ...this.options }
    delete clientOptions.method
    delete clientOptions.headers
    delete clientOptions.mode
    delete clientOptions.baseURL

    const defaultOptions: FetchableOptions = {
      method: this.options.method || 'GET',
      headers: this.options.headers || {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: this.options.mode || 'cors',
      ...clientOptions,
    }
    delete defaultOptions.baseURL

    let headers = {}
    if (options.accept) {
      headers = {
        'Accept': options.accept,
        'Content-Type': options.accept,
      }
    }

    return {
      method: options.method || defaultOptions.method,
      body: options.body || defaultOptions.body,
      headers: {
        ...defaultOptions.headers,
        ...headers,
      },
      ...defaultOptions,
      onRequestError: (ctx) => {
        this.ctx = ctx
      },
      onResponseError: (ctx) => {
        this.ctx = ctx as Ctx
      },
      retry: 5,
    }
  }

  // private async fetching<T>(params?: FetchableOptions) {
  //   const response = await ofetch(this.url, {
  //     baseURL: this.url,
  //     method,
  //     body: params?.body,
  //     params: new URLSearchParams(params?.body as any),
  //     mode: 'cors',
  //   })

  //   return response
  // }

  // private isInstanceOf<T>(object: unknown): object is T {
  //   return object instanceof T
  // }

  // private isResponse = (object: unknown): object is Response => {
  //   return object instanceof Response
  // }

  // private isFetchParams = (object: unknown): object is FetchableParams => {
  //   return object instanceof FetchableParams
  // }
}
