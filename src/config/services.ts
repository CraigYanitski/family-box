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
  // Add future services here, e.g.:
  // { id: 'chores', name: 'Chore Tracker', description: '...', path: '/chores', status: 'coming-soon' },
]
