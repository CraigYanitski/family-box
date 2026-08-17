package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type Recipe struct {
    Name          string    `json:"name"`
    Ingredients   []string  `json:"ingredients"`
    Instructions  []string  `json:"instructions"`
    CookTime      int       `json:"cook-time"`
}

type Recipes struct {
    Recipes  []Recipe  `json:"recipes"`
}

func (recipes *Recipes) append(newRecipe Recipe) bool {
    for _, r := range recipes.Recipes {
        if r.Name == newRecipe.Name {
            return false
        }
    }
    recipes.Recipes = append(recipes.Recipes, newRecipe)
    return true
}

func (recipes *Recipes) find(recipe string) *Recipe {
    for _, r := range recipes.Recipes {
        if replaceAndLower(r.Name, " ", "-") == recipe {
            return &r
        }
    }
    return nil
}

func (recipes *Recipes) remove(recipeID string) {
    for i, r := range recipes.Recipes {
        if replaceAndLower(r.Name, " ", "-") == recipeID {
            recipes.Recipes = append(recipes.Recipes[:i], recipes.Recipes[i+1:]...)
            return
        }
    }
    return
}

func (cfg apiConfig) writeRecipes() error {
	// Get env variables
	godotenv.Load()
	dataFile := os.Getenv("YANITSKIBOX_RECIPE_FILE")

    recipeBytes, err := json.MarshalIndent(cfg.recipes, "", "    ")
    if err != nil {
        return err
    }
    err = os.WriteFile(fmt.Sprintf("./content/%s", dataFile), recipeBytes, 0644)
    if err != nil {
        return err
    }
    return nil
}

func (cfg *apiConfig) createRecipeHandler(w http.ResponseWriter, r *http.Request) {
    decoder := json.NewDecoder(r.Body)
    newRecipe := &Recipe{}
    err := decoder.Decode(newRecipe)
    if err != nil {
        respondWithError(
            w,
            http.StatusBadRequest,
            "error decoding JSON of new recipe.",
            err,
        )
        return
    }

    if newRecipe.Name == "" {
        respondWithError(
            w,
            http.StatusBadRequest,
            "empty recipe submission",
            nil,
        )
        return
    }

    ok := cfg.recipes.append(*newRecipe)
    if !ok {
        respondWithError(
            w,
            http.StatusBadRequest,
            fmt.Sprintf("recipe %s already exists", newRecipe.Name),
            nil,
        )
        return
    }

    err = cfg.resetHTML()
    if err != nil {
        respondWithError(
            w,
            http.StatusInternalServerError,
            "unable to reset HTML",
            err,
        )
        return
    }

    log.Println("Created new recipe:", *newRecipe)

    respondWithJSON(w, http.StatusCreated, newRecipe)
}

func (cfg *apiConfig) getRecipeHandler(w http.ResponseWriter, r *http.Request) {
	recipeName := r.PathValue("recipe")

	if recipeName == "" {
		respondWithJSON(w, http.StatusOK, cfg.recipes.Recipes)
	} else {
		found := cfg.recipes.find(recipeName)
		if found == nil {
			respondWithError(
				w,
				http.StatusNotFound,
				fmt.Sprintf("recipe %s not found", recipeName),
				nil,
			)
        	return
		}
		respondWithJSON(w, http.StatusOK, found)
	}
}

func (cfg *apiConfig) deleteRecipeHandler(w http.ResponseWriter, r *http.Request) {
    recipeName := r.PathValue("recipe")

    found := cfg.recipes.find(recipeName)
    if found == nil {
        respondWithError(
            w,
            http.StatusNotFound,
            fmt.Sprintf("recipe %s not found", recipeName),
            nil,
        )
        return
    }

    cfg.recipes.remove(found.Name)

    err := cfg.resetHTML()
    if err != nil {
        respondWithError(
            w,
            http.StatusInternalServerError,
            "unable to reset HTML",
            err,
        )
        return
    }

    log.Println("Removed recipe:", found.Name)

    respondWithJSON(w, http.StatusOK, found)
}

func (cfg *apiConfig) editRecipeHandler(w http.ResponseWriter, r *http.Request) {
    oldRecipeName := r.PathValue("recipe")

    decoder := json.NewDecoder(r.Body)
    newRecipe := &Recipe{}
    err := decoder.Decode(newRecipe)
    if err != nil {
        respondWithError(
            w,
            http.StatusBadRequest,
            "error decoding JSON of new recipe.",
            err,
        )
        return
    }

    if newRecipe.Name == "" {
        respondWithError(
            w,
            http.StatusBadRequest,
            "empty recipe submission",
            nil,
        )
        return
    }

    cfg.recipes.remove(oldRecipeName)
    ok := cfg.recipes.append(*newRecipe)
    if !ok {
        respondWithError(
            w,
            http.StatusBadRequest,
            fmt.Sprintf("failed to update to recipe %s", newRecipe.Name),
            nil,
        )
        return
    }

    err = cfg.resetHTML()
    if err != nil {
        respondWithError(
            w,
            http.StatusInternalServerError,
            "unable to reset HTML",
            err,
        )
        return
    }

    log.Println("Updated recipe:", *newRecipe)

    respondWithJSON(w, http.StatusCreated, newRecipe)
}

