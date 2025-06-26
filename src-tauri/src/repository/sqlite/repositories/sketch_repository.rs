use rusqlite::Connection;

use crate::models;

pub fn get_by_id(id: i64, connection_str: &str) -> rusqlite::Result<models::Sketch> {
    let conn = Connection::open(connection_str).unwrap();
    let sketch = conn.query_row(
        "SELECT id, name, file_name, code, description FROM sketch WHERE id = ?",
        rusqlite::params![&id],
        |row| Ok(models::Sketch {
            id: row.get(0)?,
            name: row.get(1)?,
            file_name: row.get(2)?,
            code: row.get(3)?,
            description: row.get(4)?
        }),
    )?;
    
    Ok(sketch)
}

pub fn get_all(connection_str: &str) -> rusqlite::Result<Vec<models::Sketch>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, name, file_name, description FROM sketch")?;
    let results = stmt.query_map(
        rusqlite::params![],
        |row| Ok(models::Sketch {
            id: row.get(0)?,
            name: row.get(1)?,
            file_name: row.get(2)?,
            description: row.get(3)?,
            code: "".to_string()
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut sketches = Vec::<models::Sketch>::new();
    for result in results {
        match result {
            Ok(sketch) => sketches.push(sketch),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(sketches)
}

pub fn create(sketch: &models::Sketch, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO sketch (name, file_name, code, description) VALUES (?, ?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &sketch.name,
        &sketch.file_name,
        &sketch.code,
        &sketch.description
    ])?;

    Ok(conn.last_insert_rowid())
}

pub fn delete(id: i64, connection_str: &str) -> rusqlite::Result<()> {
    let conn = Connection::open(connection_str).unwrap();
    conn.execute("DELETE FROM sketch WHERE id = ?", rusqlite::params![&id])?;

    Ok(())
}
