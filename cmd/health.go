package main

import (
	"fmt"
	"net/http"
	"path/filepath"
)

func checkHealth(endpoint string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		res, err := http.Get("http://" + filepath.Join(endpoint, "healthz"))
		if err != nil {
			respondWithError(w, http.StatusServiceUnavailable, fmt.Sprintf("Service not available at %s", endpoint), err)
			return
		}
		if res.StatusCode >= 299 {
			respondWithError(w, http.StatusServiceUnavailable, fmt.Sprintf("Received status %d - %s from endpoint %s", res.StatusCode, res.Status, endpoint), nil)
			return
		}
		respondWithJSON(w, http.StatusOK, nil)
	}
}

