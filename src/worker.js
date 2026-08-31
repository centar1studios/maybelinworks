{
    "name": "maybelinworks",
    "compatibility_date": "2026-08-12",
    "main": "./src/worker.js",

    "assets": {
        "directory": "./public",
        "binding": "ASSETS",
        "run_worker_first": [
            "/api/*",
            "/admin/*",
            "/media/*"
        ]
    }
}