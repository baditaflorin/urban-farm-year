package utils

import (
	"log/slog"
	"os"
)

func HandleErrorOrLogWithMessages(err error, errMsg string, successMsg string) {
	logger := slog.New(slog.NewTextHandler(os.Stderr, nil))
	if err != nil {
		logger.Error(errMsg, "error", err)
		os.Exit(1)
	}
	if successMsg != "" {
		logger.Info(successMsg)
	}
}
