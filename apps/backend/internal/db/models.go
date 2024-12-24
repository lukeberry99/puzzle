// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package db

import (
	"database/sql/driver"
	"fmt"
	"time"
)

type DifficultyLevel string

const (
	DifficultyLevelEasy       DifficultyLevel = "easy"
	DifficultyLevelMedium     DifficultyLevel = "medium"
	DifficultyLevelHard       DifficultyLevel = "hard"
	DifficultyLevelImpossible DifficultyLevel = "impossible"
)

func (e *DifficultyLevel) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = DifficultyLevel(s)
	case string:
		*e = DifficultyLevel(s)
	default:
		return fmt.Errorf("unsupported scan type for DifficultyLevel: %T", src)
	}
	return nil
}

type NullDifficultyLevel struct {
	DifficultyLevel DifficultyLevel
	Valid           bool // Valid is true if DifficultyLevel is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullDifficultyLevel) Scan(value interface{}) error {
	if value == nil {
		ns.DifficultyLevel, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.DifficultyLevel.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullDifficultyLevel) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.DifficultyLevel), nil
}

type TimeLimit string

const (
	TimeLimitUnlimited TimeLimit = "unlimited"
	TimeLimit15        TimeLimit = "15"
	TimeLimit10        TimeLimit = "10"
	TimeLimit5         TimeLimit = "5"
)

func (e *TimeLimit) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = TimeLimit(s)
	case string:
		*e = TimeLimit(s)
	default:
		return fmt.Errorf("unsupported scan type for TimeLimit: %T", src)
	}
	return nil
}

type NullTimeLimit struct {
	TimeLimit TimeLimit
	Valid     bool // Valid is true if TimeLimit is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullTimeLimit) Scan(value interface{}) error {
	if value == nil {
		ns.TimeLimit, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.TimeLimit.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullTimeLimit) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.TimeLimit), nil
}

type Game struct {
	ID         int64
	Author     string
	Difficulty DifficultyLevel
	TimeLimit  TimeLimit
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type Group struct {
	ID        int64
	GameID    int64
	Link      string
	LinkTerms string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Tile struct {
	ID        int64
	GroupID   int64
	Title     string
	CreatedAt time.Time
	UpdatedAt time.Time
}