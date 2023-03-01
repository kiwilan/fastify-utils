export enum EndpointEnum {
  SAMPLE_ENDPOINT = 0,
}
export type Endpoint = keyof typeof EndpointEnum

export interface IRoute {
  endpoint: Endpoint
  query?: Record<string, string | undefined>
}

export interface ReplaceInFileBulk {
  from: string
  to: string
}
