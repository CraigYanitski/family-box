package main

import (
	"html/template"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

func replaceAndLower(input, old, new string) string {
    return strings.ToLower(strings.ReplaceAll(input, old, new))
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

func spaHandler(staticDir string) http.HandlerFunc {
    fs := http.FileServer(http.Dir(staticDir))
	return func(w http.ResponseWriter, r *http.Request) {
		// check if path exists for fileserver
		path := filepath.Join(staticDir, filepath.Clean(r.URL.Path))
		info, err := os.Stat(path)
		if ((err == nil) && !(info.IsDir())) {
			//http.ServeFile(w, r, path)
			fs.ServeHTTP(w, r)
			return
		}

		// else return index
		path = filepath.Join(staticDir, "index.html")
		http.ServeFile(w, r, path)
	}
}

