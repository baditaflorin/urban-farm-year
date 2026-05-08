package data

type Crop struct {
	ID                              string   `json:"id"`
	Name                            string   `json:"name"`
	Family                          string   `json:"family"`
	CropType                        string   `json:"crop_type"`
	FrostHardiness                  string   `json:"frost_hardiness"`
	Season                          string   `json:"season"`
	DaysToMaturity                  int      `json:"days_to_maturity"`
	IndoorStartWeeksBeforeLastFrost int      `json:"indoor_start_weeks_before_last_frost"`
	DirectSowWeeksBeforeLastFrost   int      `json:"direct_sow_weeks_before_last_frost"`
	TransplantWeeksAfterLastFrost   int      `json:"transplant_weeks_after_last_frost"`
	HarvestStartDaysAfterPlant      int      `json:"harvest_start_days_after_plant"`
	HarvestWindowDays               int      `json:"harvest_window_days"`
	SpacingCM                       int      `json:"spacing_cm"`
	WaterMMPerWeek                  int      `json:"water_mm_per_week"`
	SunHoursMin                     int      `json:"sun_hours_min"`
	PHMin                           float64  `json:"ph_min"`
	PHMax                           float64  `json:"ph_max"`
	FeedLevel                       string   `json:"feed_level"`
	Companions                      []string `json:"companions"`
	AvoidAfterFamily                string   `json:"avoid_after_family"`
	Notes                           string   `json:"notes"`
}

type CropCatalog struct {
	SchemaVersion string `json:"schema_version"`
	Crops         []Crop `json:"crops"`
}

type Location struct {
	GeoNameID         string  `json:"geoname_id"`
	Name              string  `json:"name"`
	Admin1            string  `json:"admin1"`
	CountryCode       string  `json:"country_code"`
	Latitude          float64 `json:"latitude"`
	Longitude         float64 `json:"longitude"`
	Population        int     `json:"population"`
	Timezone          string  `json:"timezone"`
	DefaultLastFrost  string  `json:"default_last_frost"`
	DefaultFirstFrost string  `json:"default_first_frost"`
}

type LocationCatalog struct {
	SchemaVersion string     `json:"schema_version"`
	Locations     []Location `json:"locations"`
}

type ArtifactMeta struct {
	SchemaVersion  string            `json:"schema_version"`
	GeneratedAt    string            `json:"generated_at"`
	SourceCommit   string            `json:"source_commit"`
	InputChecksums map[string]string `json:"input_checksums"`
	Artifacts      []string          `json:"artifacts"`
}
