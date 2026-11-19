import { readCatalog, type CatalogService } from '@pomnim/shared'
import { ApiError, api } from '../../shared/api/client'

export type { CatalogService }

export async function listServices() {
  const services = readCatalog(await api<unknown>('/api/services'))
  if (!services) throw new ApiError('Не получилось загрузить услуги')
  return services
}
