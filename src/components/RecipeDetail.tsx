import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { encodeRecipe, recipesApi } from '../api/recipes'
import type { Recipe } from '../types/recipe'
import { parseStep } from '../utils/stepParsing.ts'

export default function RecipeDetail() {
  const { name = '' } = useParams<{ name: string }>()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    recipesApi
      .get(name)
      .then((data) => {
        console.log("Data obtained")
        if (!cancelled) setRecipe(data)
      })
      .catch((err: unknown) => {
        console.log("Error caught")
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load recipe')
      })
      .finally(() => {
        console.log(`Loading ${name}`)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [name])

  async function handleDelete() {
    if (!recipe) return
    if (!window.confirm(`Delete "${recipe['name']}"? This can't be undone.`)) return

    setDeleting(true)
    try {
      await recipesApi.remove(recipe.name)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe')
      setDeleting(false)
    }
  }

  if (loading) return <p className="state-message">Loading recipe…</p>
  if (error) return <p className="state-message state-message--error">{error}</p>
  if (!recipe) return null

  return (
    <article>
      <div className="recipe-detail__header">
        <div>
          <h1 className="recipe-detail__title">{recipe['name']}</h1>
          <span className="badge-time">{recipe['cook-time']} min</span>
        </div>
        <div className="recipe-detail__actions">
          <Link to={`/recipes/${encodeRecipe(recipe['name'])}/edit`} className="btn btn--ghost">
            Edit
          </Link>
          <button className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="recipe-detail__columns">
        <section>
          <p className="section-label">Ingredients</p>
          <ul className="ingredient-list">
            {recipe["ingredients"].map((ingredient, i) => {
              const line = parseStep(ingredient)
              return (
                <li key={i} className={`ingredient-line ingredient-line--${line.type}`}>
                {line.text}
                </li>
            )})}
          </ul>
        </section>

        <section>
          <p className="section-label">Instructions</p>
          <ol className="instruction-list">
            {recipe["instructions"].map((step, i) => {
              const line = parseStep(step)
              return (
                <li key={i} className={`instruction-line instruction-line--${line.type}`}>
                  {line.text}
                </li>
              )})}
          </ol>
        </section>
      </div>
    </article>
  )
}
