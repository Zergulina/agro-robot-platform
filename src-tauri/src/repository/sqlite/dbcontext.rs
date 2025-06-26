use rusqlite::Connection;

pub fn init(connection_str: &str) {
    let conn = Connection::open(connection_str).unwrap();

    conn.execute(
    "CREATE TABLE IF NOT EXISTS sketch (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            code TEXT NOT NULL,
            description TEXT NOT NULL
        )",
        rusqlite::params![],
    ).unwrap();

    conn.execute(
    "CREATE TABLE IF NOT EXISTS sketch_param (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            macros_name VARCHAR(255) NOT NULL,
            default_value VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            regex TEXT NOT NULL,
            sketch_id INTEGER NOT NULL REFERENCES sketch(id) ON DELETE CASCADE
        )",
        rusqlite::params![],
    ).unwrap();

    conn.execute(
    "CREATE TABLE IF NOT EXISTS sketch_param_value (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value VARCHAR(255),
            sketch_param_id INTEGER NOT NULL REFERENCES sketch_param(id) ON DELETE CASCADE
        )",
        rusqlite::params![],
    ).unwrap();

    conn.execute(
    "CREATE TABLE IF NOT EXISTS sketch_procedure (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            procedure_name VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            sketch_id INTEGER NOT NULL REFERENCES sketch(id) ON DELETE CASCADE
        )",
        rusqlite::params![],
    ).unwrap();

    conn.execute(
    "CREATE TABLE IF NOT EXISTS sketch_procedure_arg (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            arg_name VARCHAR(255) NOT NULL,
            arg_type VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            sketch_procedure_id INTEGER NOT NULL REFERENCES sketch_procedure(id) ON DELETE CASCADE
        )",
        rusqlite::params![],
    ).unwrap();

    conn.execute(
    "CREATE TABLE IF NOT EXISTS sketch_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data_name VARCHAR(255) NOT NULL,
            data_type VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            sketch_id INTEGER NOT NULL REFERENCES sketch(id) ON DELETE CASCADE
        )",
        rusqlite::params![],
    ).unwrap();
}