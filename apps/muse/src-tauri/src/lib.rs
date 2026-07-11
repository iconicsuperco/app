use muse_shared::LibrarySnapshot;

#[tauri::command]
fn get_library_snapshot() -> LibrarySnapshot {
  muse_core::sample_library_snapshot()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![get_library_snapshot])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
