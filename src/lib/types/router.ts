export interface IRoute {
  endpoint: Route.Endpoint
  query?: Record<string, string | undefined>
}
