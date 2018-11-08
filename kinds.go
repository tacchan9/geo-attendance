package attendance

import (
	"time"
)

type Records struct {
	Id       string `datastore:"-" goon:"id"`
	IdStr    string
	Type       string // 1:enter 2:exit
	Time       string
	Latitude   string
	Longitude  string
	User       string
	InsertDate time.Time
	UpdateDate time.Time
	Version    string
}

