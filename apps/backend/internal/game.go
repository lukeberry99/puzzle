package models

type Tile struct {
	ID    int64  `json:"id"`
	Title string `json:"title" validate:"required"`
}

type Group struct {
	Link      string   `json:"link" validate:"required"`
	LinkTerms []string `json:"link_terms" validate:required,min=1"`
	Tiles     []Tile   `json:"tiles" validate:"required,len=4"`
}

type CreateGameRequest struct {
	Author     string  `json:"author" validate:"required"`
	Difficulty string  `json:"difficulty" validate:"required,oneof=Easy Medium Hard Impossible"`
	TimeLimit  string  `json:"time_limit" validate:"required,oneof=Unlimited 15 10 5"`
	Groups     []Group `json:"groups" validate:"required,min=1"`
}

type GameResponse struct {
	ID         int64  `json:"id"`
	Author     string `json:"author"`
	Difficulty string `json:"difficulty"`
	CreatedAt  string `json:"created_at"`
}

type CheckTilesRequest struct {
	GameID  int64   `json:"game_id" validate:"required,gt=0"`
	TileIDs []int64 `json:"tile_ids" validate:"required,len=4"`
}

type CheckTilesResponse struct {
	Correct  bool   `json:"correct"`
	LinkText string `json:"link_text,omitempty"`
}
