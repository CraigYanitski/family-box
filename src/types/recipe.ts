// Mirrors the Go struct exactly, including the `cook-time` JSON key.
//
//   type Recipe struct {
//       Name         string   `json:"name"`
//       Ingredients  []string `json:"ingredients"`
//       Instructions []string `json:"instructions"`
//       CookTime     int      `json:"cook-time"`
//   }
//
// The hyphenated key means TS code has to use bracket access
// (recipe['cook-time']) instead of dot access. If you're open to a small
// backend change, switching the Go tag to `json:"cookTime"` would let you
// use plain camelCase on both sides — purely a style nit, not required.
export interface Recipe {
  'name': string
  'ingredients': string[]
  'instructions': string[]
  'cook-time': number
}

// Shape used while a recipe is being created/edited in the form, where the
// name still acts as the identifier for PUT/DELETE requests.
export type RecipeDraft = Recipe
