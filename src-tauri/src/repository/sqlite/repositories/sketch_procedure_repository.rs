use rusqlite::Connection;

use crate::models;

pub fn get_by_sketch_id(sketch_id: i64, connection_str: &str) -> rusqlite::Result<Vec<models::SketchProcedure>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, procedure_name, name, sketch_id FROM sketch_procedure WHERE sketch_id = ?")?;
    let results = stmt.query_map(
        rusqlite::params![&sketch_id],
        |row| Ok(models::SketchProcedure {
            id: row.get(0)?,
            procedure_name: row.get(1)?,
            name: row.get(2)?,
            sketch_id: row.get(3)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut sketch_procedures = Vec::<models::SketchProcedure>::new();
    for result in results {
        match result {
            Ok(procedure) => sketch_procedures.push(procedure),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(sketch_procedures)
}

pub fn create(sketch_procedure: &models::SketchProcedure, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO sketch_procedure (procedure_name, name, sketch_id) VALUES (?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &sketch_procedure.procedure_name,
        &sketch_procedure.name,
        &sketch_procedure.sketch_id,

    ])?;

    Ok(conn.last_insert_rowid())
}