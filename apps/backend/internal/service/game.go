package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	models "github.com/lukeberry99/puzzle/internal"
	"github.com/lukeberry99/puzzle/internal/db"
)

type GameService struct {
	queries *db.Queries
}

func NewGameService(queries *db.Queries) *GameService {
	return &GameService{
		queries: queries,
	}
}

func (s *GameService) CreateGame(ctx context.Context, req models.CreateGameRequest) (int64, error) {
	gameID, err := s.queries.CreateGame(ctx, db.CreateGameParams{
		Author:  req.Author,
		Column2: db.DifficultyLevel(req.Difficulty),
		Column3: db.TimeLimit(req.TimeLimit),
	})
	if err != nil {
		return 0, err
	}

	// Create groups and tiles
	for _, group := range req.Groups {
		if err := s.createGroupWithTiles(ctx, gameID, group); err != nil {
			return 0, err
		}
	}

	return gameID, nil
}

func (s *GameService) createGroupWithTiles(ctx context.Context, gameID int64, group models.Group) error {
	//TODO: Yo we need to do this shit
	return nil
}

type games struct {
	ID         int64              `json:"id"`
	Author     string             `json:"author"`
	Difficulty db.DifficultyLevel `json:"difficulty_level"`
	CreatedAt  time.Time          `json:"created_at"`
}

func (s *GameService) FetchAllGames(ctx context.Context) ([]games, error) {
	dbGames, err := s.queries.GetAllGames(ctx)
	if err != nil {
		log.Printf("unable to fetch games: %v", err)
		return nil, err
	}

	var result []games
	for _, g := range dbGames {
		result = append(result, games{
			ID:         g.ID,
			Author:     g.Author,
			Difficulty: g.Difficulty,
			CreatedAt:  g.CreatedAt,
		})
	}
	return result, nil
}

func (s *GameService) FetchTilesForGame(ctx context.Context, gameId int64) ([]db.GetTilesForGroupRow, error) {
	// First verify the game exists
	_, err := s.queries.GetGame(ctx, gameId)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("game %d not found", gameId)
		}
		log.Printf("error fetching game %d: %v", gameId, err)
		return nil, err
	}

	groups, err := s.queries.GetGroupsForGame(ctx, gameId)
	if err != nil {
		log.Printf("unable to fetch groups for game: %d, %v", gameId, err)
		return nil, err
	}

	if len(groups) == 0 {
		log.Printf("no groups found for game: %d", gameId)
		return []db.GetTilesForGroupRow{}, nil
	}

	var tiles []db.GetTilesForGroupRow
	for _, group := range groups {
		groupTiles, err := s.queries.GetTilesForGroup(ctx, group)
		if err != nil {
			log.Printf("unable to fetch tiles for group %d: %v", group, err)
			return nil, err
		}
		if len(groupTiles) > 0 {
			tiles = append(tiles, groupTiles...)
		}
	}

	if len(tiles) == 0 {
		log.Printf("no tiles found for game: %d", gameId)
		return []db.GetTilesForGroupRow{}, nil
	}

	// Marshal and unmarshal to lowercase the keys
	jsonBytes, err := json.Marshal(tiles)
	if err != nil {
		log.Printf("error marshaling tiles: %v", err)
		return nil, err
	}

	var formattedTiles []db.GetTilesForGroupRow
	if err := json.Unmarshal(jsonBytes, &formattedTiles); err != nil {
		log.Printf("error unmarshaling tiles: %v", err)
		return nil, err
	}

	return formattedTiles, nil
}

func (s *GameService) CheckTileSelection(ctx context.Context, gameID int64, tileIDs []int64) (bool, string, error) {
	// First, verify the game exists
	_, err := s.queries.GetGame(ctx, gameID)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, "", fmt.Errorf("game not found")
		}
		return false, "", err
	}

	// Get the group ID for these tiles (they should all be in the same group)
	tiles, err := s.queries.GetTilesByIDs(ctx, tileIDs)
	if err != nil {
		return false, "", err
	}

	if len(tiles) != 4 {
		return false, "", nil
	}

	// Check if all tiles belong to the same group
	groupID := tiles[0].GroupID
	for _, tile := range tiles[1:] {
		if tile.GroupID != groupID {
			return false, "", nil
		}
	}

	// Get the group to retrieve the link text
	group, err := s.queries.GetGroup(ctx, groupID)
	if err != nil {
		return false, "", err
	}

	return true, group.Link, nil
}
