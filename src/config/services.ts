export interface Service {
  id: string
  name: string
  description: string
  path: string
  status: 'available' | 'coming-soon'
  healthCheckPath?: string
}

export const services: Service[] = [
  {
    id: 'recipes',
    name: 'Recipe Box',
    description: 'Browse, add, and edit recipes stored on the home server.',
    path: '/recipes',
    status: 'available',
  },
  {
    id: 'media',
    name: 'Photo Box',
    description: 'Browse and view images on home workstation.',
    path: 'media/images',
    status: 'coming-soon',
    healthCheckPath: "/api/media/healthz",
  },
  {
    id: 'media',
    name: 'Video Box',
    description: 'Browse and view video on home workstation.',
    path: 'media/videos',
    status: 'coming-soon',
    healthCheckPath: "/api/media/healthz",
  },
  // Add future services here, e.g.:
  // { id: 'chores', name: 'Chore Tracker', description: '...', path: '/chores', status: 'coming-soon' },
]
