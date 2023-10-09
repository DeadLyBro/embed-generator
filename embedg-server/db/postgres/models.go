// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.18.0

package postgres

import (
	"database/sql"
	"encoding/json"
	"time"
)

type CustomBot struct {
	ID                      string
	GuildID                 string
	ApplicationID           string
	Token                   string
	PublicKey               string
	UserID                  string
	UserName                string
	UserDiscriminator       string
	UserAvatar              sql.NullString
	HandledFirstInteraction bool
	CreatedAt               time.Time
}

type CustomCommand struct {
	ID          string
	GuildID     string
	Name        string
	Description string
	Enabled     bool
	Actions     json.RawMessage
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeployedAt  sql.NullTime
}

type Entitlement struct {
	ID        string
	UserID    sql.NullString
	GuildID   sql.NullString
	UpdatedAt time.Time
	Deleted   bool
	SkuID     string
	StartsAt  sql.NullTime
	EndsAt    sql.NullTime
}

type MessageActionSet struct {
	ID        string
	MessageID string
	SetID     string
	Actions   json.RawMessage
}

type SavedMessage struct {
	ID          string
	CreatorID   string
	GuildID     sql.NullString
	UpdatedAt   time.Time
	Name        string
	Description sql.NullString
	Data        json.RawMessage
}

type Session struct {
	TokenHash   string
	UserID      string
	GuildIds    []string
	AccessToken string
	CreatedAt   time.Time
	ExpiresAt   time.Time
}

type SharedMessage struct {
	ID        string
	CreatedAt time.Time
	ExpiresAt time.Time
	Data      json.RawMessage
}

type User struct {
	ID            string
	Name          string
	Discriminator string
	Avatar        sql.NullString
	IsTester      bool
}
