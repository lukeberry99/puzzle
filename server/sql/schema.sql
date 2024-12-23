-- Create enums for difficulty and time limit
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'impossible');
CREATE TYPE time_limit AS ENUM ('unlimited', '15', '10', '5');

-- Games table
CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    difficulty difficulty_level NOT NULL,
    time_limit time_limit NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Groups table (4 groups per game)
CREATE TABLE groups (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    link TEXT NOT NULL,
    link_terms TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tiles table (4 tiles per group)
CREATE TABLE tiles (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

