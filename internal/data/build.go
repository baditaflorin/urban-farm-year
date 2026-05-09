package data

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"time"
)

const SchemaVersion = "1"

func BuildArtifacts(rawDir string, outDir string, sourceCommit string) error {
	cropPath := filepath.Join(rawDir, "crops.csv")
	locationPath := filepath.Join(rawDir, "geonames_seed.csv")

	crops, err := LoadCrops(cropPath)
	if err != nil {
		return fmt.Errorf("load crops: %w", err)
	}
	locations, err := LoadLocations(locationPath)
	if err != nil {
		return fmt.Errorf("load locations: %w", err)
	}

	sort.Slice(crops, func(i, j int) bool { return crops[i].ID < crops[j].ID })
	sort.Slice(locations, func(i, j int) bool {
		if locations[i].CountryCode == locations[j].CountryCode {
			return locations[i].Name < locations[j].Name
		}
		return locations[i].CountryCode < locations[j].CountryCode
	})

	checksums, err := inputChecksums(cropPath, locationPath)
	if err != nil {
		return err
	}

	meta := ArtifactMeta{
		SchemaVersion:  SchemaVersion,
		GeneratedAt:    time.Now().UTC().Format(time.RFC3339),
		SourceCommit:   sourceCommit,
		InputChecksums: checksums,
		Artifacts: []string{
			"crops.json",
			"locations.json",
			"garden-data.meta.json",
		},
	}

	parent := filepath.Dir(outDir)
	if err := os.MkdirAll(parent, 0o755); err != nil {
		return fmt.Errorf("create output parent: %w", err)
	}
	tempDir, err := os.MkdirTemp(parent, ".garden-data-*")
	if err != nil {
		return fmt.Errorf("create temp output: %w", err)
	}
	defer os.RemoveAll(tempDir)

	if err := writeJSON(filepath.Join(tempDir, "crops.json"), CropCatalog{SchemaVersion: SchemaVersion, Crops: crops}); err != nil {
		return err
	}
	if err := writeJSON(filepath.Join(tempDir, "locations.json"), LocationCatalog{SchemaVersion: SchemaVersion, Locations: locations}); err != nil {
		return err
	}
	if err := writeJSON(filepath.Join(tempDir, "garden-data.meta.json"), meta); err != nil {
		return err
	}

	if err := os.MkdirAll(outDir, 0o755); err != nil {
		return fmt.Errorf("create output dir: %w", err)
	}
	for _, name := range meta.Artifacts {
		if err := os.Rename(filepath.Join(tempDir, name), filepath.Join(outDir, name)); err != nil {
			return fmt.Errorf("publish %s: %w", name, err)
		}
	}
	return nil
}

func writeJSON(path string, value interface{}) error {
	file, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("create json: %w", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(value); err != nil {
		return fmt.Errorf("encode json: %w", err)
	}
	return nil
}

func inputChecksums(paths ...string) (map[string]string, error) {
	out := make(map[string]string, len(paths))
	for _, path := range paths {
		sum, err := fileSHA256(path)
		if err != nil {
			return nil, err
		}
		out[filepath.Base(path)] = sum
	}
	return out, nil
}

func fileSHA256(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", fmt.Errorf("open checksum input: %w", err)
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", fmt.Errorf("hash input: %w", err)
	}
	return hex.EncodeToString(hash.Sum(nil)), nil
}
