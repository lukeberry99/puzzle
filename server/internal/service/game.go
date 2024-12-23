package service

import (
	"context"
	"database/sql"
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

func (s *GameService) FetchTilesForGame(ctx context.Context, gameId int64) ([]string, error) {
	groups, err := s.queries.GetGroupsForGame(ctx, gameId)
	if err != nil {
		log.Printf("unable to fetch groups for game: %d, %v", gameId, err)

		return nil, err
	}

	var tiles []string

	for _, group := range groups {
		groupTiles, err := s.queries.GetTilesForGroup(ctx, group)
		if err != nil {
			log.Printf("unable to fetch tiles for group %d: %v", group, err)
			return nil, err
		}
		tiles = append(tiles, groupTiles...)
	}

	return tiles, nil
}

func (s *GameService) CheckTileSelection(ctx context.Context, gameID int64, tileIDs []int64) (bool, error) {
	// First, verify the game exists
	_, err := s.queries.GetGame(ctx, gameID)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, fmt.Errorf("game not found")
		}
		return false, err
	}

	// Get the group ID for these tiles (they should all be in the same group)
	tiles, err := s.queries.GetTilesByIDs(ctx, tileIDs)
	if err != nil {
		return false, err
	}

	if len(tiles) != 4 {
		return false, nil
	}

	// Check if all tiles belong to the same group
	groupID := tiles[0].GroupID
	for _, tile := range tiles[1:] {
		if tile.GroupID != groupID {
			return false, nil
		}
	}

	return true, nil
}
