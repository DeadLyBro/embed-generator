package custom_bots

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/merlinfuchs/discordgo"
	"github.com/merlinfuchs/embed-generator/embedg-server/api/access"
	"github.com/merlinfuchs/embed-generator/embedg-server/api/helpers"
	"github.com/merlinfuchs/embed-generator/embedg-server/api/wire"
	"github.com/merlinfuchs/embed-generator/embedg-server/bot"
	"github.com/merlinfuchs/embed-generator/embedg-server/db/postgres"
	"github.com/merlinfuchs/embed-generator/embedg-server/util"
	"github.com/spf13/viper"
	"gopkg.in/guregu/null.v4"
)

type CustomBotsHandler struct {
	pg  *postgres.PostgresStore
	bot *bot.Bot
	am  *access.AccessManager
}

func New(pg *postgres.PostgresStore, bot *bot.Bot, am *access.AccessManager) *CustomBotsHandler {
	return &CustomBotsHandler{
		pg:  pg,
		bot: bot,
		am:  am,
	}
}

func (h *CustomBotsHandler) HandleConfigureCustomBot(c *fiber.Ctx, req wire.CustomBotConfigureRequestWire) error {
	guildID := c.Query("guild_id")
	if err := h.am.CheckGuildAccessForRequest(c, guildID); err != nil {
		return err
	}

	session, err := discordgo.New("Bot " + req.Token)
	if err != nil {
		return err
	}

	app, err := session.Application("@me")
	if err != nil {
		if derr, ok := err.(*discordgo.RESTError); ok && derr.Response.StatusCode == 401 {
			return fmt.Errorf("Invalid bot token, please check it again.")
		}
		return err
	}

	user, err := session.User("@me")
	if err != nil {
		return err
	}

	isMember := true
	_, err = session.GuildMember(guildID, user.ID)
	if err != nil {
		if derr, ok := err.(*discordgo.RESTError); ok && derr.Message.Code == discordgo.ErrCodeMissingAccess {
			isMember = false
		}
		return err
	}

	// TODO: check if bot has manage webhook permissions

	customBot, err := h.pg.Q.UpsertCustomBot(c.Context(), postgres.UpsertCustomBotParams{
		ID:            util.UniqueID(),
		GuildID:       guildID,
		ApplicationID: app.ID,
		UserID:        user.ID,
		UserName:      user.Username,
		UserAvatar:    sql.NullString{String: user.Avatar, Valid: user.Avatar != ""},
		Token:         req.Token,
		PublicKey:     app.VerifyKey,
		CreatedAt:     time.Now().UTC(),
	})
	if err != nil {
		return err
	}

	return c.JSON(wire.CustomBotConfigureResponseWire{
		Success: true,
		Data: wire.CustomBotInfoWire{
			ID:            customBot.ID,
			ApplicationID: customBot.ApplicationID,
			UserID:        customBot.UserID,
			UserName:      customBot.UserName,
			UserAvatar:    null.String{NullString: customBot.UserAvatar},

			TokenValid:             true,
			IsMember:               isMember,
			InviteURL:              botInvite(customBot.ApplicationID, guildID),
			InteractionEndpointURL: interactionEndpointURL(customBot.ID),
		},
	})
}

func (h *CustomBotsHandler) HandleGetCustomBot(c *fiber.Ctx) error {
	guildID := c.Query("guild_id")
	if err := h.am.CheckGuildAccessForRequest(c, guildID); err != nil {
		return err
	}

	customBot, err := h.pg.Q.GetCustomBotByGuildID(c.Context(), guildID)
	if err != nil {
		if err == sql.ErrNoRows {
			return helpers.NotFound("not_configured", "There is no custom bot configured right now")
		}
		return err
	}

	session, err := discordgo.New("Bot " + customBot.Token)
	if err != nil {
		return err
	}

	isMember := true
	tokenValid := true
	hasPermissions := true // TODO
	_, err = session.GuildMember(guildID, customBot.UserID)
	if err != nil {
		if derr, ok := err.(*discordgo.RESTError); ok {
			if derr.Response.StatusCode == 401 {
				tokenValid = false
				isMember = false
			}
			if derr.Message.Code == discordgo.ErrCodeMissingAccess {
				isMember = false
			}
		}
		return err
	}

	return c.JSON(wire.CustomBotConfigureResponseWire{
		Success: true,
		Data: wire.CustomBotInfoWire{
			ID:            customBot.ID,
			ApplicationID: customBot.ApplicationID,
			UserID:        customBot.UserID,
			UserName:      customBot.UserName,
			UserAvatar:    null.String{NullString: customBot.UserAvatar},

			TokenValid:             tokenValid,
			IsMember:               isMember,
			HasPermissions:         hasPermissions,
			InviteURL:              botInvite(customBot.ApplicationID, guildID),
			InteractionEndpointURL: interactionEndpointURL(customBot.ID),
		},
	})
}

func botInvite(clientID, guildID string) string {
	return fmt.Sprintf("https://discord.com/oauth2/authorize?client_id=%s&scope=bot&permissions=536870912&guild_id=%s", clientID, guildID)
}

func interactionEndpointURL(id string) string {
	return fmt.Sprintf("%s/gateway/%s", viper.GetString("api.public_url"), id)
}
