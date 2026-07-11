use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackSummary {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration_seconds: u32,
    pub format: String,
    pub relative_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LibrarySnapshot {
    pub library_name: String,
    pub track_count: usize,
    pub total_duration_seconds: u32,
    pub tracks: Vec<TrackSummary>,
}
