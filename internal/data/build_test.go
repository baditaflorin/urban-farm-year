package data

import (
	"os"
	"path/filepath"
	"testing"
)

func TestBuildArtifactsWritesCatalogs(t *testing.T) {
	rawDir := t.TempDir()
	outDir := filepath.Join(t.TempDir(), "public", "data", "v1")

	crops := "id,name,family,crop_type,frost_hardiness,season,days_to_maturity,indoor_start_weeks_before_last_frost,direct_sow_weeks_before_last_frost,transplant_weeks_after_last_frost,harvest_start_days_after_plant,harvest_window_days,spacing_cm,water_mm_per_week,sun_hours_min,ph_min,ph_max,feed_level,companions,avoid_after_family,notes\n" +
		"lettuce,Lettuce,Asteraceae,leaf,semi-hardy,cool,45,4,-4,0,30,50,20,18,4,6.0,7.0,light,carrot|radish,Asteraceae,Shade in heat\n"
	locations := "geoname_id,name,admin1,country_code,latitude,longitude,population,timezone,default_last_frost,default_first_frost\n" +
		"1,Test City,Test,US,40.0,-75.0,1000,America/New_York,04-15,10-30\n"

	if err := os.WriteFile(filepath.Join(rawDir, "crops.csv"), []byte(crops), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(rawDir, "geonames_seed.csv"), []byte(locations), 0o644); err != nil {
		t.Fatal(err)
	}

	if err := BuildArtifacts(rawDir, outDir, "testsha"); err != nil {
		t.Fatal(err)
	}

	for _, name := range []string{"crops.json", "locations.json", "garden-data.meta.json"} {
		if _, err := os.Stat(filepath.Join(outDir, name)); err != nil {
			t.Fatalf("expected %s: %v", name, err)
		}
	}
}
