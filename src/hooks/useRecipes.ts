import { useCallback, useEffect, useState } from 'react'
import { recipesApi } from '../api/recipes'
import type { Recipe } from '../types/recipe'

interface UseRecipesResult {
  recipes: Recipe[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useRecipes(): UseRecipesResult {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    recipesApi
      .list()
      .then((data) => {
        if (!cancelled) setRecipes(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load recipes')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [version])

  return { recipes, loading, error, refetch }
}
