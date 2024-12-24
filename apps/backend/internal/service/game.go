package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"

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

func (s *GameService) FetchAllGames(ctx context.Context) ([]db.GetAllGamesRow, error) {
	games, err := s.queries.GetAllGames(ctx)
	if err != nil {
		log.Printf("unable to fetch games: %v", err)
		return nil, err

	}
	return games, nil
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
