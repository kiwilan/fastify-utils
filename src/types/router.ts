export enum EndpointEnum {
  '/' = 0,
}
export type Endpoint = keyof typeof EndpointEnum

export interface IRoute {
  endpoint: Endpoint
  query?: Record<string, string | undefined>
}
