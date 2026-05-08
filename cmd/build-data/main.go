package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/baditaflorin/urban-farm-year/internal/data"
	"github.com/baditaflorin/urban-farm-year/internal/utils"
)

func main() {
	start := flag.Int("start", 0, "start offset for batch-compatible generation")
	end := flag.Int("end", 0, "end offset for batch-compatible generation")
	concurrency := flag.Int("concurrency", 1, "worker count for future enrichment")
	saveEvery := flag.Int("saveEvery", 100, "save progress every N records")
	rawDir := flag.String("raw", "data/raw", "raw input directory")
	outDir := flag.String("out", "public/data/v1", "artifact output directory")
	flag.Parse()

	if *concurrency < 1 {
		utils.HandleErrorOrLogWithMessages(fmt.Errorf("concurrency must be >= 1"), "invalid flags", "")
	}
	if *start < 0 || *end < 0 || *saveEvery < 1 {
		utils.HandleErrorOrLogWithMessages(fmt.Errorf("start end and saveEvery must be positive"), "invalid flags", "")
	}

	err := data.BuildArtifacts(*rawDir, *outDir, sourceCommit())
	utils.HandleErrorOrLogWithMessages(err, "failed to build static data", "static data generated")
}

func sourceCommit() string {
	if value := strings.TrimSpace(os.Getenv("SOURCE_COMMIT")); value != "" {
		return value
	}
	cmd := exec.Command("git", "rev-parse", "--short", "HEAD")
	output, err := cmd.Output()
	if err != nil {
		return "unknown"
	}
	return strings.TrimSpace(string(output))
}
