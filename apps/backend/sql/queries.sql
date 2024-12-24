-- name: GetAllGames :many
SELECT
    id,
    author,
    difficulty,
    created_at
FROM
    games;

-- name: GetGroupsForGame :many
SELECT
    id 
FROM 
    groups
WHERE
    game_id = $1;

-- name: GetGroup :one
SELECT
    *
FROM
    groups
WHERE
    id = $1;

-- name: GetTilesForGroup :many
SELECT
    id,
    title 
FROM 
    tiles 
WHERE
    group_id = $1;

-- name: ValidateTilesInSameGroup :one
WITH tile_count AS (
    SELECT group_id, COUNT(*) as tile_count
    FROM tiles
    WHERE id = ANY($1::bigint[])
    GROUP BY group_id
)
SELECT EXISTS (
    SELECT 1 
    FROM tile_count 
    WHERE tile_count = 4
) AS is_valid;


-- name: CreateGame :one
INSERT INTO games (
    author,
    difficulty,
    time_limit
) VALUES (
    $1,
    $2::difficulty_level,
    $3::time_limit
)
RETURNING id;

-- name: CreateGroup :one
INSERT INTO groups (
    game_id,
    link,
    link_terms
) VALUES (
    $1,
    $2,
    $3
)
RETURNING id;

-- name: CreateTilesForGroup :exec
INSERT INTO tiles (
    group_id,
    title
) VALUES ($1, $2);

-- name: GetTilesByIDs :many
SELECT * FROM tiles
WHERE id = ANY($1::bigint[]);

-- name: GetGame :one
SELECT * FROM games
WHERE id = $1;
