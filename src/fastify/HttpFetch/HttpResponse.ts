import type { Ctx, FetchableOptions, FetchableParams, Response } from '@/src/types'

interface Request<T> {
  options: FetchableOptions
  res: Response<T>
  params?: FetchableParams
  ctx?: Ctx
}

export class HttpResponse<T = object> {
  protected constructor(
    public options: FetchableOptions,
    public ctx?: Ctx,
    public response?: Response<T>,
    public params?: FetchableParams,
    public body?: T,
    public ok?: boolean,
    public status?: number,
    public statusText?: string,
    public url?: string,
    public headers?: Headers,
    public type?: ResponseType,
  ) {}

  public static make<T>(request: Request<T>): Promise<HttpResponse<T>> {
    const http = new HttpResponse<T>(request.options, request.ctx, request.res, request.params)

    if (request.res === undefined) {
      http.response = {
        ok: false,
        status: 0,
        statusText: 'No response',
        url: request.params?.url ?? '',
        headers: new Headers(),
        type: 'basic',
      } as unknown as Response<T>
    }

    http.body = http.response?._data as unknown as T

    http.ok = http.response?.ok
    http.status = http.response?.status
    http.statusText = http.response?.statusText
    http.url = http.response?.url
    http.headers = http.response?.headers
    http.type = http.response?.type

    return http as unknown as Promise<HttpResponse<T>>
  }
}
