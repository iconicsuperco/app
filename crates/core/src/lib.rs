use muse_shared::{LibrarySnapshot, TrackSummary};

pub fn sample_library_snapshot() -> LibrarySnapshot {
    let tracks = vec![
        TrackSummary {
            id: "track_001".into(),
            title: "Daydream Receiver".into(),
            artist: "Muse Local".into(),
            album: "Offline Summer".into(),
            duration_seconds: 223,
            format: "FLAC".into(),
            relative_path: "library/Muse Local/Offline Summer/01 Daydream Receiver.flac".into(),
        },
        TrackSummary {
            id: "track_002".into(),
            title: "Night Transit".into(),
            artist: "Aster Lane".into(),
            album: "City Signals".into(),
            duration_seconds: 201,
            format: "MP3".into(),
            relative_path: "library/Aster Lane/City Signals/02 Night Transit.mp3".into(),
        },
        TrackSummary {
            id: "track_003".into(),
            title: "Static Bloom".into(),
            artist: "North Arcade".into(),
            album: "Glass Rooms".into(),
            duration_seconds: 257,
            format: "AAC".into(),
            relative_path: "library/North Arcade/Glass Rooms/07 Static Bloom.m4a".into(),
        },
    ];

    let total_duration_seconds = tracks.iter().map(|track| track.duration_seconds).sum();

    LibrarySnapshot {
        library_name: "Muse Library".into(),
        track_count: tracks.len(),
        total_duration_seconds,
        tracks,
    }
}

#[cfg(test)]
mod tests {
    use super::sample_library_snapshot;

    #[test]
    fn sample_snapshot_counts_tracks_and_duration() {
        let snapshot = sample_library_snapshot();

        assert_eq!(snapshot.track_count, 3);
        assert_eq!(snapshot.total_duration_seconds, 681);
    }
}
