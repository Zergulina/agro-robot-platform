use rusqlite::Connection;

use crate::models;

pub fn get_by_sketch_id(sketch_id: i64, connection_str: &str) -> rusqlite::Result<Vec<models::SketchData>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, data_name, data_type, name, sketch_id FROM sketch_data WHERE sketch_id = ?")?;
    let results = stmt.query_map(
        rusqlite::params![&sketch_id],
        |row| Ok(models::SketchData {
            id: row.get(0)?,
            data_name: row.get(1)?,
            data_type: row.get(2)?,
            name: row.get(3)?,
            sketch_id: row.get(4)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut sketch_datas = Vec::<models::SketchData>::new();
    for result in results {
        match result {
            Ok(sketch_data) => sketch_datas.push(sketch_data),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(sketch_datas)
}

pub fn create(sketch_data: &models::SketchData, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO sketch_data (data_name, data_type, name, sketch_id) VALUES (?, ?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &sketch_data.data_name,
        &sketch_data.data_type,
        &sketch_data.name,
        &sketch_data.sketch_id
    ])?;

    Ok(conn.last_insert_rowid())
}