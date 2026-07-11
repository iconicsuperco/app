use actix_web::{web, App, HttpResponse, HttpServer, middleware::Logger};
use muse_core::sample_library_snapshot;

#[actix_web::get("/api/library/snapshot")]
async fn get_library_snapshot() -> HttpResponse {
    let snapshot = sample_library_snapshot();
    HttpResponse::Ok().json(snapshot)
}

#[actix_web::get("/health")]
async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({"status": "ok"}))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();

    log::info!("Starting Muse API server on http://127.0.0.1:5173");

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .wrap(actix_web::middleware::NormalizePath::trim())
            .service(get_library_snapshot)
            .service(health_check)
            .default_service(web::route().to(|| async {
                HttpResponse::NotFound().json(serde_json::json!({"error": "Not Found"}))
            }))
    })
    .bind("127.0.0.1:3001")?
    .run()
    .await
}
