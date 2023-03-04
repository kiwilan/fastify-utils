export type EnvironmentTypeJson = 'string' | 'number' | 'boolean' | 'array' | 'object'
export interface EnvironmentJson {
  dotenv: Record<string, EnvironmentTypeJson>
}
