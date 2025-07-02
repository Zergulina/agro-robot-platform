use rusqlite::Connection;

use crate::models;

pub fn get_by_command_id(module_command_id: i64, connection_str: &str) -> rusqlite::Result<Vec<models::ModuleCommandArg>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, arg_name, arg_type, name, module_command_id FROM module_command_arg WHERE module_command_id = ?")?;
    let results = stmt.query_map(
        rusqlite::params![&module_command_id],
        |row| Ok(models::ModuleCommandArg {
            id: row.get(0)?,
            arg_name: row.get(1)?,
            arg_type: row.get(2)?,
            name: row.get(3)?,
            module_command_id: row.get(4)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut module_command_args = Vec::<models::ModuleCommandArg>::new();
    for result in results {
        match result {
            Ok(command_arg) => module_command_args.push(command_arg),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(module_command_args)
}

pub fn create(module_command_arg: &models::ModuleCommandArg, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO module_command_arg (arg_name, arg_type, name, module_command_id) VALUES (?, ?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &module_command_arg.arg_name,
        &module_command_arg.arg_type,
        &module_command_arg.name,
        &module_command_arg.module_command_id,
    ])?;

    Ok(conn.last_insert_rowid())
}