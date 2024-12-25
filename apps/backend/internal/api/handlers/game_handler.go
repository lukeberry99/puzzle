package handlers

import (
	"encoding/json"
	"net/http"

	models "github.com/lukeberry99/puzzle/internal"
	"github.com/lukeberry99/puzzle/internal/api/response"
	"github.com/lukeberry99/puzzle/internal/service"
)

type GameHandler struct {
	gameService *service.GameService
}

func NewGameHandler(gs *service.GameService) *GameHandler {
	return &GameHandler{
		gameService: gs,
	}
}

func (h *GameHandler) CreateGame(w http.ResponseWriter, r *http.Request) {
	var req models.CreateGameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request format")
		return
	}
	defer r.Body.Close()

	gameID, err := h.gameService.CreateGame(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to create game")
		return
	}

	response.JSON(w, http.StatusCreated, map[string]interface{}{
		"game_id": gameID,
		"status":  "success",
	})
}

func (h *GameHandler) ListGames(w http.ResponseWriter, r *http.Request) {
	games, err := h.gameService.FetchAllGames(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to fetch games")
		return
	}

	response.JSON(w, http.StatusOK, games)
}
