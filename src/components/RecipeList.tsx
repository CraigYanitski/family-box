import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import RecipeCard from './RecipeCard'

export default function RecipeList() {
  const { recipes, loading, error, refetch } = useRecipes()

  if (loading) {
    return <p className="state-message">Loading recipes…</p>
  }

  if (error) {
    return (
      <div className="state-message state-message--error">
        Couldn't load recipes: {error}
        <div style={{ marginTop: 12 }}>
          <button className="btn btn--ghost" onClick={refetch}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (recipes.length === 0) {
    return <p className="state-message">No recipes yet. Add your first one to get started.</p>
  }

  return (
    <div>
      <div className="page-header">
        <p className="section-label" style={{ margin: 0 }}>Recipe Box</p>
        <Link to="/recipes/new" className="btn btn--primary">+ New Recipe</Link>
      </div>
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.name} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
