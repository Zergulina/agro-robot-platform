use rusqlite::Connection;

use crate::models;

pub fn get_by_module_id(module_id: i64, connection_str: &str) -> rusqlite::Result<Vec<models::ModuleCommand>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, command_name, name, module_id FROM module_command WHERE module_id = ?")?;
    let results = stmt.query_map(
        rusqlite::params![&module_id],
        |row| Ok(models::ModuleCommand {
            id: row.get(0)?,
            command_name: row.get(1)?,
            name: row.get(2)?,
            module_id: row.get(3)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut module_commands = Vec::<models::ModuleCommand>::new();
    for result in results {
        match result {
            Ok(command) => module_commands.push(command),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(module_commands)
}

pub fn create(module_command: &models::ModuleCommand, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO module_command (command_name, name, module_id) VALUES (?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &module_command.command_name,
        &module_command.name,
        &module_command.module_id,

    ])?;

    Ok(conn.last_insert_rowid())
}