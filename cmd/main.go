package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type apiConfig struct {
    recipes  Recipes
}

func main() {
	// Get env variables
	godotenv.Load()
	port := os.Getenv("YANITSKIBOX_PORT")
	dataFile := os.Getenv("YANITSKIBOX_RECIPE_FILE")
	mediaPort := os.Getenv("VITE_YANITSKIBOX_MEDIA_PORT")

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
    //fs := http.FileServer(http.Dir("./dist"))
    mux.Handle("GET /", allowCreate(spaHandler("./dist")))

	// recipes API
	mux.HandleFunc("GET /api/recipes", apiCfg.getRecipeHandler)
    mux.HandleFunc("POST /api/recipes", apiCfg.createRecipeHandler)
    mux.HandleFunc("GET /api/recipes/{recipe}", apiCfg.getRecipeHandler)
    mux.HandleFunc("PUT /api/recipes/{recipe}", apiCfg.editRecipeHandler)
    mux.Handle("DELETE /api/recipes/{recipe}", http.HandlerFunc(apiCfg.deleteRecipeHandler))

	// media API
	mux.HandleFunc("GET /api/media/healthz", checkHealth(mediaPort))

    server := http.Server{
        Addr: ":"+port,
        Handler: mux,
    }

    log.Printf("Serving recipes on port %s\n", port)
    log.Fatal(server.ListenAndServe())
}

