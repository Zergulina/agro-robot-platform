use rusqlite::Connection;

use crate::models;

pub fn get_by_sketch_id(sketch_id: i64, connection_str: &str) -> rusqlite::Result<Vec<models::SketchParam>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, macros_name, default_value, name, regex, sketch_id FROM sketch_param WHERE sketch_id = ?")?;
    let results = stmt.query_map(
        rusqlite::params![&sketch_id],
        |row| Ok(models::SketchParam {
            id: row.get(0)?,
            macros_name: row.get(1)?,
            default_value: row.get(2)?,
            name: row.get(3)?,
            regex: row.get(4)?,
            sketch_id: row.get(5)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut sketch_params = Vec::<models::SketchParam>::new();
    for result in results {
        match result {
            Ok(sketch_param) => sketch_params.push(sketch_param),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(sketch_params)
}

pub fn create(sketch_param: &models::SketchParam, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO sketch_param (macros_name, default_value, name, regex, sketch_id) VALUES (?, ?, ?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &sketch_param.macros_name,
        &sketch_param.default_value,
        &sketch_param.name,
        &sketch_param.regex,
        &sketch_param.sketch_id
    ])?;

    Ok(conn.last_insert_rowid())
}