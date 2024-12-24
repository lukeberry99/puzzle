package config

import (
	"fmt"
	"os"
)

type Config struct {
	DBConnString string
}

func Load() (*Config, error) {
	dbConnStr := os.Getenv("DB_CONN_STR")
	if dbConnStr == "" {
		return nil, fmt.Errorf("DB_CONN_STR environment variable is not set")
	}

	return &Config{
		DBConnString: dbConnStr,
	}, nil
}
