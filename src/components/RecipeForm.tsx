import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { encodeRecipe, recipesApi } from '../api/recipes'
import type { Recipe } from '../types/recipe'
import StepEditor from './StepEditor'
import { Step, parseStep, formatStep } from '../utils/stepParsing'

const emptyRecipe: Recipe = {
  name: '',
  ingredients: [''],
  instructions: [''],
  'cook-time': 30,
}

interface Props {
  mode: 'create' | 'edit'
}

export default function RecipeForm({ mode }: Props) {
  const { name: routeName = '' } = useParams<{ name: string }>()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState<Recipe>(emptyRecipe)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [instructions, setInstructions] = useState<Step[]>([{ type: 'step', text: '' }])
  const [ingredients, setIngredients] = useState<Step[]>([{ type: 'step', text: '' }])

  useEffect(() => {
    if (mode !== 'edit') return
    let cancelled = false

    recipesApi
      .get(routeName)
      .then((data) => {
        if (!cancelled) {
          setRecipe(data)
          setIngredients(
              data.ingredients.length > 0 ? data.ingredients.map(parseStep) : [{ type: 'step', text: '' }]
          )
          setInstructions(
              data.instructions.length > 0 ? data.instructions.map(parseStep) : [{ type: 'step', text: '' }]
          )
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load recipe')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [mode, routeName])

  function updateIngredients(index: number, line: Step) {
      setIngredients((lines) => lines.map((l, i) => (i === index ? line : l)))
  }

  function addIngredient() {
      setIngredients((lines) => [...lines, { type:"step", text: '' }])
  }

  function removeIngredient(index: number) {
      setIngredients((lines) => lines.filter((_, i) => i !== index))
  }

  function updateInstructions(index: number, line: Step) {
      setInstructions((lines) => lines.map((l, i) => (i === index ? line : l)))
  }

  function addInstruction() {
      setInstructions((lines) => [...lines, { type:"step", text: '' }])
  }

  function removeInstruction(index: number) {
      setInstructions((lines) => lines.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const cleaned: Recipe = {
      ...recipe,
      ingredients: ingredients
        .map((l) => ({ ...l, text: l.text.trim() }))
        .filter((l) => l.text.length > 0)
        .map(formatStep),//recipe.ingredients.map((i) => i.trim()).filter(Boolean),
      instructions: instructions
        .map((l) => ({ ...l, text: l.text.trim() }))
        .filter((l) => l.text.length > 0)
        .map(formatStep),//recipe.instructions.map((i) => i.trim()).filter(Boolean),
    }

    try {
      if (mode === 'create') {
        await recipesApi.create(cleaned)
      } else {
        await recipesApi.update(routeName, cleaned)
      }
      navigate(`/recipes/${encodeRecipe(cleaned.name)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
      setSaving(false)
    }
  }

  if (loading) return <p className="state-message">Loading recipe…</p>

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <h1 className="recipe-detail__title" style={{ fontSize: '1.6rem' }}>
        {mode === 'create' ? 'New recipe' : `Edit ${routeName}`}
      </h1>

      {error && <p className="state-message state-message--error">{error}</p>}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          required
          value={recipe.name}
          onChange={(e) => setRecipe((r) => ({ ...r, name: e.target.value }))}
        />
      </div>

      <div className="field">
        <label htmlFor="cook-time">Cook time (minutes)</label>
        <input
          id="cook-time"
          type="number"
          min={0}
          required
          value={recipe['cook-time']}
          onChange={(e) => setRecipe((r) => ({ ...r, 'cook-time': Number(e.target.value) }))}
        />
      </div>

      <StepEditor
        lines={ingredients}
        onChange={updateIngredients}
        onAdd={addIngredient}
        onRemove={removeIngredient}
      />

      <StepEditor
        lines={instructions}
        onChange={updateInstructions}
        onAdd={addInstruction}
        onRemove={removeInstruction}
      />

      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save recipe'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

//interface ListFieldProps {
//  label: string
//  items: string[]
//  placeholder: string
//  multiline?: boolean
//  onChange: (index: number, value: string) => void
//  onAdd: () => void
//  onRemove: (index: number) => void
//}

//function ListField({ label, items, placeholder, multiline, onChange, onAdd, onRemove }: ListFieldProps) {
//  return (
//    <div className="field">
//      <label>{label}</label>
//      <div className="list-editor">
//        {items.map((item, i) => (
//          <div className="list-editor__row" key={i}>
//            {multiline ? (
//              <textarea
//                rows={2}
//                placeholder={placeholder}
//                value={item}
//                onChange={(e) => onChange(i, e.target.value)}
//              />
//            ) : (
//              <input
//                type="text"
//                placeholder={placeholder}
//                value={item}
//                onChange={(e) => onChange(i, e.target.value)}
//              />
//            )}
//            <button
//              type="button"
//              className="icon-btn"
//              onClick={() => onRemove(i)}
//              disabled={items.length === 1}
//              aria-label={`Remove ${label.toLowerCase()} item ${i + 1}`}
//            >
//              ×
//            </button>
//          </div>
//        ))}
//      </div>
//      <button type="button" className="btn btn--ghost" onClick={onAdd} style={{ alignSelf: 'flex-start' }}>
//        + Add {label.toLowerCase().replace(/s$/, '')}
//      </button>
//    </div>
//  )
//}
