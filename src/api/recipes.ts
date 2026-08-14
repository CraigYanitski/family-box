import type { Recipe } from '../types/recipe'

// In dev, Vite proxies /api to your Go server (see vite.config.ts).
// In production, set VITE_API_BASE_URL to wherever the Go binary is served
// from, or leave it unset if the frontend is served by the same Go process.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new ApiError(res.status, body || `Request failed: ${res.status}`)
  }

  // DELETE requests typically have no body.
  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export function encodeRecipe(recipe: string): string {
    return recipe.toLowerCase().replaceAll(" ", "-")
}

// NOTE: these routes are a reasonable REST guess (GET list, GET one,
// POST create, PUT update-by-name, DELETE by-name). Adjust the paths and
// verbs here to match whatever your Go router actually exposes — this file
// is the only place that needs to change.
export const recipesApi = {
  list: () => request<Recipe[]>('/recipes'),

  get: (name: string) => request<Recipe>(`/recipes/${encodeRecipe(name)}`),

  create: (recipe: Recipe) =>
    request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    }),

  update: (originalName: string, recipe: Recipe) =>
    request<Recipe>(`/recipes/${encodeRecipe(originalName)}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    }),

  remove: (name: string) =>
    request<void>(`/recipes/${encodeRecipe(name)}`, {
      method: 'DELETE',
    }),
}

export { ApiError }
