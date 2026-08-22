import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import RecipeCard from '../components/RecipeCard'
import PageBody from '../components/PageBody'

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
      <PageBody>
        <p>
        Here you can view, create, edit, and delete recipes to your liking.
        Each recipe has a title, ingredients, instructions, and a total cook time.
        </p>

        <p>
        The title should be unique, since the server does not support duplicate items.
        </p>

        <p>
        The ingredients and instructions can also contain section titles (such as "base" or "filling")
        or notes (such as alternate suggestions) as well as the regular recipe steps,
        and this can be identified by a drop-down box when editing the recipe.
        </p>

        <p>
        Finally, the cook time is specified in minutes. This will be improved in due time.
        </p>
      </PageBody>
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
