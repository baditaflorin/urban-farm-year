package data

import (
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
)

func LoadCrops(path string) ([]Crop, error) {
	records, err := readNamedCSV(path)
	if err != nil {
		return nil, err
	}

	crops := make([]Crop, 0, len(records))
	for idx, row := range records {
		crop, err := cropFromRow(row)
		if err != nil {
			return nil, fmt.Errorf("crop row %d: %w", idx+2, err)
		}
		crops = append(crops, crop)
	}
	return crops, nil
}

func LoadLocations(path string) ([]Location, error) {
	records, err := readNamedCSV(path)
	if err != nil {
		return nil, err
	}

	locations := make([]Location, 0, len(records))
	for idx, row := range records {
		location, err := locationFromRow(row)
		if err != nil {
			return nil, fmt.Errorf("location row %d: %w", idx+2, err)
		}
		locations = append(locations, location)
	}
	return locations, nil
}

func readNamedCSV(path string) ([]map[string]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("open csv: %w", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true

	headers, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("read headers: %w", err)
	}

	var rows []map[string]string
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("read row: %w", err)
		}
		if len(record) != len(headers) {
			return nil, fmt.Errorf("expected %d columns got %d", len(headers), len(record))
		}
		row := make(map[string]string, len(headers))
		for i, header := range headers {
			row[header] = strings.TrimSpace(record[i])
		}
		rows = append(rows, row)
	}
	return rows, nil
}

func cropFromRow(row map[string]string) (Crop, error) {
	days, err := parseInt(row, "days_to_maturity")
	if err != nil {
		return Crop{}, err
	}
	indoor, err := parseInt(row, "indoor_start_weeks_before_last_frost")
	if err != nil {
		return Crop{}, err
	}
	direct, err := parseInt(row, "direct_sow_weeks_before_last_frost")
	if err != nil {
		return Crop{}, err
	}
	transplant, err := parseInt(row, "transplant_weeks_after_last_frost")
	if err != nil {
		return Crop{}, err
	}
	harvestStart, err := parseInt(row, "harvest_start_days_after_plant")
	if err != nil {
		return Crop{}, err
	}
	harvestWindow, err := parseInt(row, "harvest_window_days")
	if err != nil {
		return Crop{}, err
	}
	spacing, err := parseInt(row, "spacing_cm")
	if err != nil {
		return Crop{}, err
	}
	water, err := parseInt(row, "water_mm_per_week")
	if err != nil {
		return Crop{}, err
	}
	sun, err := parseInt(row, "sun_hours_min")
	if err != nil {
		return Crop{}, err
	}
	phMin, err := parseFloat(row, "ph_min")
	if err != nil {
		return Crop{}, err
	}
	phMax, err := parseFloat(row, "ph_max")
	if err != nil {
		return Crop{}, err
	}

	return Crop{
		ID:                              row["id"],
		Name:                            row["name"],
		Family:                          row["family"],
		CropType:                        row["crop_type"],
		FrostHardiness:                  row["frost_hardiness"],
		Season:                          row["season"],
		DaysToMaturity:                  days,
		IndoorStartWeeksBeforeLastFrost: indoor,
		DirectSowWeeksBeforeLastFrost:   direct,
		TransplantWeeksAfterLastFrost:   transplant,
		HarvestStartDaysAfterPlant:      harvestStart,
		HarvestWindowDays:               harvestWindow,
		SpacingCM:                       spacing,
		WaterMMPerWeek:                  water,
		SunHoursMin:                     sun,
		PHMin:                           phMin,
		PHMax:                           phMax,
		FeedLevel:                       row["feed_level"],
		Companions:                      splitList(row["companions"]),
		AvoidAfterFamily:                row["avoid_after_family"],
		Notes:                           row["notes"],
	}, nil
}

func locationFromRow(row map[string]string) (Location, error) {
	lat, err := parseFloat(row, "latitude")
	if err != nil {
		return Location{}, err
	}
	lon, err := parseFloat(row, "longitude")
	if err != nil {
		return Location{}, err
	}
	population, err := parseInt(row, "population")
	if err != nil {
		return Location{}, err
	}

	return Location{
		GeoNameID:         row["geoname_id"],
		Name:              row["name"],
		Admin1:            row["admin1"],
		CountryCode:       row["country_code"],
		Latitude:          lat,
		Longitude:         lon,
		Population:        population,
		Timezone:          row["timezone"],
		DefaultLastFrost:  row["default_last_frost"],
		DefaultFirstFrost: row["default_first_frost"],
	}, nil
}

func parseInt(row map[string]string, key string) (int, error) {
	value, err := strconv.Atoi(row[key])
	if err != nil {
		return 0, fmt.Errorf("parse %s: %w", key, err)
	}
	return value, nil
}

func parseFloat(row map[string]string, key string) (float64, error) {
	value, err := strconv.ParseFloat(row[key], 64)
	if err != nil {
		return 0, fmt.Errorf("parse %s: %w", key, err)
	}
	return value, nil
}

func splitList(value string) []string {
	if value == "" {
		return nil
	}
	parts := strings.Split(value, "|")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
