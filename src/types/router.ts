export type Endpoint = '/'

export interface IRoute {
  endpoint: Endpoint
  query?: Record<string, string | undefined>
}
