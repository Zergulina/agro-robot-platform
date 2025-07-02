use rusqlite::Connection;

use crate::models;

pub fn get_by_id(id: i64, connection_str: &str) -> rusqlite::Result<models::Module> {
    let conn = Connection::open(connection_str).unwrap();
    let module = conn.query_row(
        "SELECT id, name, file_name, code, description FROM module WHERE id = ?",
        rusqlite::params![&id],
        |row| Ok(models::Module {
            id: row.get(0)?,
            name: row.get(1)?,
            file_name: row.get(2)?,
            code: row.get(3)?,
            description: row.get(4)?
        }),
    )?;
    
    Ok(module)
}

pub fn get_all(connection_str: &str) -> rusqlite::Result<Vec<models::Module>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, name, file_name, description, code FROM module")?;
    let results = stmt.query_map(
        rusqlite::params![],
        |row| Ok(models::Module {
            id: row.get(0)?,
            name: row.get(1)?,
            file_name: row.get(2)?,
            description: row.get(3)?,
            code: row.get(4)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut sketches = Vec::<models::Module>::new();
    for result in results {
        match result {
            Ok(module) => sketches.push(module),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(sketches)
}

pub fn create(module: &models::Module, connection_str: &str) -> rusqlite::Result<i64> {
    println!("{}", module.code);
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO module (name, file_name, code, description) VALUES (?, ?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &module.name,
        &module.file_name,
        &module.code,
        &module.description
    ])?;

    Ok(conn.last_insert_rowid())
}

pub fn delete(id: i64, connection_str: &str) -> rusqlite::Result<()> {
    let conn = Connection::open(connection_str).unwrap();
    conn.execute("DELETE FROM module WHERE id = ?", rusqlite::params![&id])?;

    Ok(())
}
