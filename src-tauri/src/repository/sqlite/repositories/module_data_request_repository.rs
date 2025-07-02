use rusqlite::Connection;

use crate::models;

pub fn get_by_module_id(module_id: i64, connection_str: &str) -> rusqlite::Result<Vec<models::ModuleDataRequest>> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn.prepare("SELECT id, data_request_name, data_request_type, name, module_id FROM module_data_request WHERE module_id = ?")?;
    let results = stmt.query_map(
        rusqlite::params![&module_id],
        |row| Ok(models::ModuleDataRequest {
            id: row.get(0)?,
            data_request_name: row.get(1)?,
            data_request_type: row.get(2)?,
            name: row.get(3)?,
            module_id: row.get(4)?,
        }),
    )?;

    let results: Vec<_> = results.collect();
    let mut module_datas = Vec::<models::ModuleDataRequest>::new();
    for result in results {
        match result {
            Ok(module_data) => module_datas.push(module_data),
            Err(error) => {
                return  Err(error);
            }
        }
    }
    
    Ok(module_datas)
}

pub fn create(module_data: &models::ModuleDataRequest, connection_str: &str) -> rusqlite::Result<i64> {
    let conn = Connection::open(connection_str).unwrap();
    let mut stmt = conn
        .prepare("INSERT INTO module_data_request (data_request_name, data_request_type, name, module_id) VALUES (?, ?, ?, ?)")?;
    stmt.execute(rusqlite::params![
        &module_data.data_request_name,
        &module_data.data_request_type,
        &module_data.name,
        &module_data.module_id
    ])?;

    Ok(conn.last_insert_rowid())
}