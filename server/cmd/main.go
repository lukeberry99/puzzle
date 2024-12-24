package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"

	_ "github.com/lib/pq"
	"github.com/lukeberry99/puzzle/internal/config"
	"github.com/lukeberry99/puzzle/internal/db"
	"github.com/lukeberry99/puzzle/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config %v", err)
	}

	dbConn, err := sql.Open("postgres", cfg.DBConnString)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer dbConn.Close()

	queries := db.New(dbConn)

	gameService := service.NewGameService(queries)

	// Handler for creating a new game
	http.HandleFunc("/game", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			log.Printf("Invalid method %s for /game endpoint", r.Method)
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Read the request body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Failed to read request body: %v", err)
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		type tiles struct {
			Title string `json:"title"`
		}
		type groups struct {
			Link      string   `json:"link"`
			LinkTerms []string `json:"link_terms"`
			Tiles     []tiles  `json:"tiles"`
		}
		// Parse the request
		var createGameReq struct {
			Author     string   `json:"author"`
			Difficulty string   `json:"difficulty"`
			TimeLimit  string   `json:"time_limit"`
			Groups     []groups `json:"groups"` // JSON string
		}

		if err := json.Unmarshal(body, &createGameReq); err != nil {
			log.Printf("Failed to parse JSON request body: %v.", err)
			http.Error(w, "Invalid JSON format", http.StatusBadRequest)
			return
		}

		log.Printf("Creating new game with author: %s, difficulty: %s, time limit: %s",
			createGameReq.Author, createGameReq.Difficulty, createGameReq.TimeLimit)

		// Create the game
		gameID, err := queries.CreateGame(r.Context(), db.CreateGameParams{
			Author:  createGameReq.Author,
			Column2: db.DifficultyLevel(createGameReq.Difficulty),
			Column3: db.TimeLimit(createGameReq.TimeLimit),
		})
		if err != nil {
			log.Printf("Failed to create game in database: %v.", err)
			http.Error(w, "Failed to create game", http.StatusInternalServerError)
			return
		}
		log.Printf("Successfully created game with ID: %d", gameID)

		for _, group := range createGameReq.Groups {
			groupId, err := queries.CreateGroup(r.Context(), db.CreateGroupParams{
				GameID:    gameID,
				Link:      group.Link,
				LinkTerms: strings.Join(group.LinkTerms, ","),
			})
			if err != nil {
				log.Printf("Failed to create group in database: %v", err)
				http.Error(w, "Failed to create group", http.StatusInternalServerError)
				return
			}

			for _, tile := range group.Tiles {
				err := queries.CreateTilesForGroup(r.Context(), db.CreateTilesForGroupParams{
					GroupID: groupId,
					Title:   tile.Title,
				})
				if err != nil {
					log.Printf("Failed to create tile in database: %v", err)
					http.Error(w, "Failed to create tile", http.StatusInternalServerError)
					return
				}
			}
		}

		// Return the created game ID
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"game_id": gameID,
			"status":  "success",
		})
	})

	http.HandleFunc("/games", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		games, err := gameService.FetchAllGames(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		type gameResponse struct {
			ID         int64  `json:"id"`
			Author     string `json:"author"`
			Difficulty string `json:"difficulty"`
			CreatedAt  string `json:"created_at"`
		}

		var response []gameResponse
		for _, game := range games {
			response = append(response, gameResponse{
				ID:         game.ID,
				Author:     game.Author,
				Difficulty: string(game.Difficulty),
				CreatedAt:  game.CreatedAt.String(),
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	http.HandleFunc("/games/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		gameID, err := strconv.ParseInt(r.URL.Path[len("/games/"):], 10, 64)
		if err != nil {
			http.Error(w, "Invalid game ID", http.StatusBadRequest)
			return
		}
		tiles, err := gameService.FetchTilesForGame(r.Context(), gameID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		type tileStruct struct {
			ID    int64  `json:"id"`
			Title string `json:"title"`
		}

		var tileResponse []tileStruct
		for _, tile := range tiles {
			tileResponse = append(tileResponse, tileStruct{
				ID:    tile.ID,
				Title: tile.Title,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"game_id": gameID,
			"tiles":   tileResponse,
		})
	})

	// Handler for validating tile selections
	http.HandleFunc("/games/check", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Read and parse the request body
		var checkRequest struct {
			GameID  int64   `json:"game_id"`
			TileIDs []int64 `json:"tile_ids"`
		}

		if err := json.NewDecoder(r.Body).Decode(&checkRequest); err != nil {
			http.Error(w, "Invalid JSON format", http.StatusBadRequest)
			return
		}

		// Validate input
		if checkRequest.GameID <= 0 {
			http.Error(w, "Invalid game ID", http.StatusBadRequest)
			return
		}
		if len(checkRequest.TileIDs) != 4 {
			http.Error(w, "Must select exactly 4 tiles", http.StatusBadRequest)
			return
		}

		// Check if the tiles form a valid group
		isCorrect, err := gameService.CheckTileSelection(r.Context(), checkRequest.GameID, checkRequest.TileIDs)
		if err != nil {
			if strings.Contains(err.Error(), "not found") {
				http.Error(w, err.Error(), http.StatusNotFound)
				return
			}
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Return the result
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"correct": isCorrect,
		})
	})

	log.Printf("Server starting on :8181")
	if err := http.ListenAndServe(":8181", nil); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
