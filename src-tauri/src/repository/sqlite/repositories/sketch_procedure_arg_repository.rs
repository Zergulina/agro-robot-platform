use rusqlite::Connection;

use crate::models;

pub fn get_by_procedure_id(sketch_procedure_id: i64, connection_str: &str) -> rusqlite::Result<Vec<models::SketchProcedureArg>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, arg_name, arg_type, name, sketch_procedure_id FROM sketch_procedure_arg WHERE sketch_procedure_id = ?")?;
    let results = stmt.query_map(
        rusqlite::params![&sketch_procedure_id],
        |row| Ok(models::SketchProcedureArg {
            id: row.get(0)?,
            arg_name: row.get(1)?,
            arg_type: row.get(2)?,
            name: row.get(3)?,
            sketch_procedure_id: row.get(4)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut sketch_procedure_args = Vec::<models::SketchProcedureArg>::new();
    for result in results {
        match result {
            Ok(procedure_arg) => sketch_procedure_args.push(procedure_arg),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(sketch_procedure_args)
}

pub fn create(sketch_procedure_arg: &models::SketchProcedureArg, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO sketch_procedure_arg (arg_name, arg_type, name, sketch_procedure_id) VALUES (?, ?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &sketch_procedure_arg.arg_name,
        &sketch_procedure_arg.arg_type,
        &sketch_procedure_arg.name,
        &sketch_procedure_arg.sketch_procedure_id,
    ])?;

    Ok(conn.last_insert_rowid())
}