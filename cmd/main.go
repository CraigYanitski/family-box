package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

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

func replaceAndLower(input, old, new string) string {
    return strings.ToLower(strings.ReplaceAll(input, old, new))
}

type apiConfig struct {
    recipes  Recipes
}

func main() {
	// Get env variables
	godotenv.Load()
	port := os.Getenv("YANITSKIBOX_PORT")
	dataFile := os.Getenv("YANITSKIBOX_RECIPE_FILE")

    // open and unmarshal recipe json
    recipeDataBytes, err := os.ReadFile(fmt.Sprintf("./content/%s", dataFile))
    if err != nil {
        panic(err)
    }
    var recipes Recipes
    if err = json.Unmarshal(recipeDataBytes, &recipes); err != nil {
        panic(err)
    }

    apiCfg := apiConfig{
        recipes: recipes,
    }

    err = apiCfg.resetHTML()
    if err != nil {
        panic(err)
    }

    mux := http.NewServeMux()

	// File Server
    fs := http.FileServer(http.Dir("./dist"))
    mux.Handle("GET /", allowCreate(fs))

	// API
	mux.HandleFunc("GET /api/recipes", apiCfg.getRecipeHandler)
    mux.HandleFunc("POST /api/recipes", apiCfg.createRecipeHandler)
    mux.HandleFunc("GET /api/recipes/{recipe}", apiCfg.getRecipeHandler)
    mux.HandleFunc("PUT /api/recipes/{recipe}", apiCfg.editRecipeHandler)
    mux.Handle("DELETE /api/recipes/{recipe}", http.HandlerFunc(apiCfg.deleteRecipeHandler))

    server := http.Server{
        Addr: ":"+port,
        Handler: mux,
    }

    log.Printf("Serving recipes on port %s\n", port)
    log.Fatal(server.ListenAndServe())
}

func allowCreate(next http.Handler) http.Handler {
    return http.HandlerFunc(
        func(w http.ResponseWriter, r *http.Request) {
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Set("Access-Control-Allow-Methods", "POST")
            w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
            next.ServeHTTP(w, r)
        },
    )
}

func allowDelete(next http.Handler) http.Handler {
    return http.HandlerFunc(
        func(w http.ResponseWriter, r *http.Request) {
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Set("Access-Control-Allow-Methods", "POST")
            w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
            next.ServeHTTP(w, r)
        },
    )
}

func clearDir(dir string) error {
    contents, err := os.ReadDir(dir)
    if err != nil {
        return err
    }

    for _, item := range contents {
        err = os.RemoveAll(filepath.Join(dir, item.Name()))
        if err != nil {
            return err
        }
    }
    return nil
}

func copyFile(src, dst string) error {
    srcFile, err := os.Open(src)
    if err != nil {
        return err
    }
    defer srcFile.Close()
    dstFile, err := os.Create(dst)
    if err != nil {
        return err
    }
    defer dstFile.Close()
    if _, err = io.Copy(dstFile, srcFile); err != nil {
        return err
    }
    return nil
}

func copyDir(src, dst string) error {
    // This currently ignores nested directories
    srcInfo, err := os.Stat(src)
    if err != nil {
        return err
    }
    err = os.MkdirAll(dst, srcInfo.Mode())
    if err != nil {
        return err
    }
    files, err := os.ReadDir(src)
    if err != nil {
        return err
    }
    for _, file := range files {
        srcFile := filepath.Join(src, file.Name())
        dstFile := filepath.Join(dst, file.Name())
        if !file.IsDir() {
            err = copyFile(srcFile, dstFile)
            if err != nil {
                return err
            }
        }
    }
    return nil
}

func (cfg apiConfig) writeHTML() error {
    // copy static files
    err := copyFile("./static/addRecipeForm.js", "./public/addRecipeForm.js")
    if err != nil {
        panic(err)
    }

    err = copyFile("./static/deleteRecipeForm.js", "./public/deleteRecipeForm.js")
    if err != nil {
        panic(err)
    }

    err = copyFile("./static/index.css", "./public/index.css")
    if err != nil {
        panic(err)
    }
    
    err = copyDir("./static/images/favicon", "./public/images")
    if err != nil {
        panic(err)
    }

    // read in html templates
    // index
    indexBytes, err := os.ReadFile("./static/index.html")
    if err != nil {
        return err
    }
    indexTemplate := string(indexBytes)
    // recipe
    recipeBytes, err := os.ReadFile("./static/recipe.html")
    if err != nil {
        return err
    }
    recipeTemplate := string(recipeBytes)

    // write html files
    funcMap := template.FuncMap{
        "replace": replaceAndLower,
    }
    // index
    file, err := os.Create("./public/index.html")
    if err != nil {
        return err
    }
    defer file.Close()

    temp := template.Must(template.New("").Funcs(funcMap).Parse(indexTemplate))
    if err = temp.Execute(file, cfg.recipes); err != nil {
        return err
    }
    // recipe
    for _, recipe := range cfg.recipes.Recipes {
        dirname := replaceAndLower(recipe.Name, " ", "-")
        if err = os.Mkdir("./public/"+dirname, 0700); err != nil {
            return err
        }
        recipeFile, err := os.Create("./public/"+dirname+"/index.html")
        if err != nil {
            return err
        }

        temp := template.Must(template.New("").Funcs(funcMap).Parse(recipeTemplate))
        if err = temp.Execute(recipeFile, recipe); err != nil {
            return err
        }

        recipeFile.Close()
    }

    return nil
}

func (cfg apiConfig) resetHTML() error {
    sort.Slice(cfg.recipes.Recipes, func(i, j int) bool {
        first := replaceAndLower(cfg.recipes.Recipes[i].Name, " ", "-")
        second := replaceAndLower(cfg.recipes.Recipes[j].Name, " ", "-")
        return first < second
    })

    err := cfg.writeRecipes()
    if err != nil {
        return err
    }

    //err = clearDir("./public")
    //if err != nil {
    //    return err
    //}

    //err = cfg.writeHTML()
    //if err != nil {
    //    return err
    //}

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

