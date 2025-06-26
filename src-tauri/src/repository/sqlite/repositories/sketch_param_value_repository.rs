use rusqlite::Connection;

use crate::models;

pub fn get_by_param_id(sketch_param_id: i64, connection_str: &str) -> rusqlite::Result<Vec<models::SketchParamValue>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, value, sketch_param_id FROM sketch_param_value WHERE sketch_param_id = ?")?;
    let results = stmt.query_map(
        rusqlite::params![&sketch_param_id],
        |row| Ok(models::SketchParamValue {
            id: row.get(0)?,
            value: row.get(1)?,
            sketch_param_id: row.get(2)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut sketch_param_values = Vec::<models::SketchParamValue>::new();
    for result in results {
        match result {
            Ok(param_value) => sketch_param_values.push(param_value),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(sketch_param_values)
}

pub fn create(sketch_param_value: &models::SketchParamValue, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO sketch_param_value (value, sketch_param_id) VALUES (?, ?)")?;
    stmt.execute(rusqlite::params![
        &sketch_param_value.value,
        &sketch_param_value.sketch_param_id,
    ])?;

    Ok(conn.last_insert_rowid())
}