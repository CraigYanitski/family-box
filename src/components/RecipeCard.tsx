import { Link } from 'react-router-dom'
import type { Recipe } from '../types/recipe'
import { encodeRecipe } from '../api/recipes.ts'

interface Props {
  recipe: Recipe
}

// For overhead tabs
//      <span className="recipe-card__tab" aria-hidden="true">
//        {recipe.name.charAt(0).toUpperCase()}
//      </span>
export default function RecipeCard({ recipe }: Props) {
  return (
    <Link to={`/recipes/${encodeRecipe(recipe.name)}`} className="recipe-card">
      <h3 className="recipe-card__name">{recipe.name}</h3>
      <div className="recipe-card__meta">
        <span className="badge-time">{recipe['cook-time']} min</span>
        <span>{recipe.ingredients.length} ingredients</span>
      </div>
    </Link>
  )
}
