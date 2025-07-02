pub mod dtos;
pub mod models;
pub mod repository;

use std::{env, fs};

use rfd::FileDialog;

use crate::dtos::{
    CreateModuleRequest, CreateSketchRequest, LoadedFile, MicroControllerSketch, ModuleCommandArgResponse, ModuleCommandResponse, ModuleDataRequestResponse, ModuleResponse, NewSketchFile, SketchDataResponse, SketchFullInfo, SketchParamResponse, SketchParamValueResponse, SketchProcedureArgResponse, SketchProcedureResponse
};
use crate::models::{ModuleCommand, SketchData, SketchProcedureArg};
use crate::repository::sqlite::repositories::{self, sketch_repository};

struct DbConnection(String);

#[tauri::command]
fn get_sketch_code_from_new_file() -> Result<NewSketchFile, String> {
    let file = FileDialog::new()
        .add_filter("Arduino files", &["ino"])
        .set_title("Выберите Arduino файл")
        .pick_file();

    if let Some(path) = file {
        let contents = fs::read_to_string(&path).or(Err("Ошибка при чтении файла"))?;
        let file_name = path.file_name();
        let file_name = file_name.unwrap().to_str().unwrap();
        return Ok(NewSketchFile {
            code: contents,
            file_name: file_name.to_string(),
        });
    }

    Err("".to_string())
}

#[tauri::command]
fn get_saved_data() -> Result<LoadedFile, String> {
    let file = FileDialog::new()
        .add_filter("Files", &["arpmod", "arpproj"])
        .set_title("Выберите файл")
        .pick_file();

    if let Some(path) = file {
        let contents = fs::read_to_string(&path).or(Err("Ошибка при чтении файла"))?;
        return Ok(LoadedFile {
            path: String::from(path.to_str().unwrap()),
            data: contents,
        });
    }

    Err("".to_string())
}

#[tauri::command]
fn save_as_module(data: String) -> Result<String, String> {
    if let Some(path) = FileDialog::new()
        .add_filter("Module files", &["arpmod"])
        .set_title("Выберите файл модуля")
        .save_file()
    {
        std::fs::write(&path, data).or(Err("Ошибка при записи файла"))?;
        return Ok(String::from(path.to_str().unwrap()));
    }

    Err("".to_string())
}

#[tauri::command]
fn save_module(path: String, data: String) -> Result<(), String> {
    std::fs::write(&path, data).or(Err("Ошибка при записи файла"))?;
    return Ok(());
}

#[tauri::command]
fn save_as_project(data: String) -> Result<String, String> {
    if let Some(path) = FileDialog::new()
        .add_filter("Module files", &["arpproj"])
        .set_title("Выберите файл модуля")
        .save_file()
    {
        std::fs::write(&path, data).or(Err("Ошибка при записи файла"))?;
        return Ok(String::from(path.to_str().unwrap()));
    }

    Err("".to_string())
}

#[tauri::command]
fn save_project(path: String, data: String) -> Result<(), String> {
    std::fs::write(&path, data).or(Err("Ошибка при записи файла"))?;
    return Ok(());
}

#[tauri::command]
fn create_sketch(
    create_sketch_request: CreateSketchRequest,
    connection_str: tauri::State<DbConnection>,
) -> Result<(), String> {
    let sketch_id = repositories::sketch_repository::create(
        &models::Sketch {
            id: 0,
            name: create_sketch_request.name,
            file_name: create_sketch_request.file_name,
            code: create_sketch_request.code,
            description: create_sketch_request.description,
        },
        connection_str.0.as_str(),
    )
    .or(Err("Ошибка при добавлении скетча"))?;
    for sketch_param in create_sketch_request.params {
        let sketch_param_id = repositories::sketch_param_repository::create(
            &models::SketchParam {
                id: 0,
                macros_name: sketch_param.macros_name,
                default_value: sketch_param.default_value,
                name: sketch_param.name,
                regex: sketch_param.regex,
                sketch_id,
            },
            connection_str.0.as_str(),
        )
        .or(Err("Ошибка при добавлении скетча"))?;

        for sketch_param_value in sketch_param.value_list {
            repositories::sketch_param_value_repository::create(
                &models::SketchParamValue {
                    id: 0,
                    value: sketch_param_value.value,
                    sketch_param_id: sketch_param_id,
                },
                connection_str.0.as_str(),
            )
            .or(Err("Ошибка при добавлении скетча"))?;
        }
    }

    for sketch_procedure in create_sketch_request.procedures {
        let sketch_procedure_id = repositories::sketch_procedure_repository::create(
            &models::SketchProcedure {
                id: 0,
                procedure_name: sketch_procedure.procedure_name,
                name: sketch_procedure.name,
                sketch_id: sketch_id,
            },
            connection_str.0.as_str(),
        )
        .or(Err("Ошибка при добавлении скетча"))?;

        for sketch_procedure_arg in sketch_procedure.args {
            repositories::sketch_procedure_arg_repository::create(
                &SketchProcedureArg {
                    id: 0,
                    arg_name: sketch_procedure_arg.arg_name,
                    arg_type: sketch_procedure_arg.arg_type,
                    name: sketch_procedure_arg.name,
                    sketch_procedure_id: sketch_procedure_id,
                },
                connection_str.0.as_str(),
            )
            .or(Err("Ошибка при добавлении скетча"))?;
        }
    }

    for sketch_data in create_sketch_request.datas {
        repositories::sketch_data_repository::create(
            &SketchData {
                id: 0,
                data_name: sketch_data.data_name,
                data_type: sketch_data.data_type,
                name: sketch_data.name,
                sketch_id,
            },
            connection_str.0.as_str(),
        )
        .or(Err("Ошибка при добавлении скетча"))?;
    }

    Ok(())
}

#[tauri::command]
fn get_all_sketches_full_info(
    connection_str: tauri::State<DbConnection>,
) -> Result<Vec<dtos::SketchFullInfo>, String> {
    let sketches = repositories::sketch_repository::get_all(connection_str.0.as_str())
        .or(Err("Ошибка при получении скетча"))?;

    let sketch_responses: Vec<dtos::SketchFullInfo> = sketches
        .iter()
        .map(|sketch| {
            let mut sketch_param_responses: Vec<SketchParamResponse> =
                repositories::sketch_param_repository::get_by_sketch_id(
                    sketch.id,
                    connection_str.0.as_str(),
                )
                .unwrap()
                .iter()
                .map(|param| SketchParamResponse {
                    id: param.id,
                    macros_name: param.macros_name.clone(),
                    default_value: param.default_value.clone(),
                    name: param.name.clone(),
                    regex: param.regex.clone(),
                    value_list: Vec::<dtos::SketchParamValueResponse>::new(),
                })
                .collect();

            sketch_param_responses.iter_mut().for_each(|sketch_param| {
                sketch_param.value_list =
                    repositories::sketch_param_value_repository::get_by_param_id(
                        sketch_param.id,
                        connection_str.0.as_str(),
                    )
                    .unwrap()
                    .iter()
                    .map(|value| SketchParamValueResponse {
                        id: value.id,
                        value: value.value.clone(),
                    })
                    .collect();
            });

            let mut sketch_procedure_responses: Vec<SketchProcedureResponse> =
                repositories::sketch_procedure_repository::get_by_sketch_id(
                    sketch.id,
                    connection_str.0.as_str(),
                )
                .unwrap()
                .iter()
                .map(|procedure| SketchProcedureResponse {
                    id: procedure.id,
                    name: procedure.name.clone(),
                    procedure_name: procedure.procedure_name.clone(),
                    args: Vec::<SketchProcedureArgResponse>::new(),
                })
                .collect();

            sketch_procedure_responses
                .iter_mut()
                .for_each(|sketch_procedure| {
                    sketch_procedure.args =
                        repositories::sketch_procedure_arg_repository::get_by_procedure_id(
                            sketch_procedure.id,
                            connection_str.0.as_str(),
                        )
                        .unwrap()
                        .iter()
                        .map(|arg| SketchProcedureArgResponse {
                            id: arg.id,
                            arg_name: arg.arg_name.clone(),
                            arg_type: arg.arg_type.clone(),
                            name: arg.name.clone(),
                        })
                        .collect();
                });

            let sketch_datas: Vec<SketchDataResponse> =
                repositories::sketch_data_repository::get_by_sketch_id(
                    sketch.id,
                    connection_str.0.as_str(),
                )
                .unwrap()
                .iter()
                .map(|data| SketchDataResponse {
                    id: data.id,
                    name: data.name.clone(),
                    data_name: data.data_name.clone(),
                    data_type: data.data_type.clone(),
                })
                .collect();

            SketchFullInfo {
                id: sketch.id,
                name: sketch.name.clone(),
                file_name: sketch.file_name.clone(),
                description: sketch.description.clone(),
                params: sketch_param_responses,
                procedures: sketch_procedure_responses,
                datas: sketch_datas,
            }
        })
        .collect();

    Ok(sketch_responses)
}

#[tauri::command]
fn delete_sketch_by_id(id: i64, connection_str: tauri::State<DbConnection>) -> Result<(), String> {
    sketch_repository::delete(id, connection_str.0.as_str()).or(Err("Ошибка удаления скетча"))?;
    Ok(())
}

#[tauri::command]
fn get_micro_controller_sketch_by_id(
    id: i64,
    connection_str: tauri::State<DbConnection>,
) -> Result<MicroControllerSketch, String> {
    let sketch = sketch_repository::get_by_id(id, connection_str.0.as_str())
        .or(Err("Ошибка получения скеча"))?;

    let mut sketch_param_responses: Vec<SketchParamResponse> =
        repositories::sketch_param_repository::get_by_sketch_id(
            sketch.id,
            connection_str.0.as_str(),
        )
        .unwrap()
        .iter()
        .map(|param| SketchParamResponse {
            id: param.id,
            macros_name: param.macros_name.clone(),
            default_value: param.default_value.clone(),
            name: param.name.clone(),
            regex: param.regex.clone(),
            value_list: Vec::<dtos::SketchParamValueResponse>::new(),
        })
        .collect();

    sketch_param_responses.iter_mut().for_each(|sketch_param| {
        sketch_param.value_list = repositories::sketch_param_value_repository::get_by_param_id(
            sketch_param.id,
            connection_str.0.as_str(),
        )
        .unwrap()
        .iter()
        .map(|value| SketchParamValueResponse {
            id: value.id,
            value: value.value.clone(),
        })
        .collect();
    });

    let mut sketch_procedure_responses: Vec<SketchProcedureResponse> =
        repositories::sketch_procedure_repository::get_by_sketch_id(
            sketch.id,
            connection_str.0.as_str(),
        )
        .unwrap()
        .iter()
        .map(|procedure| SketchProcedureResponse {
            id: procedure.id,
            name: procedure.name.clone(),
            procedure_name: procedure.procedure_name.clone(),
            args: Vec::<SketchProcedureArgResponse>::new(),
        })
        .collect();

    sketch_procedure_responses
        .iter_mut()
        .for_each(|sketch_procedure| {
            sketch_procedure.args =
                repositories::sketch_procedure_arg_repository::get_by_procedure_id(
                    sketch_procedure.id,
                    connection_str.0.as_str(),
                )
                .unwrap()
                .iter()
                .map(|arg| SketchProcedureArgResponse {
                    id: arg.id,
                    arg_name: arg.arg_name.clone(),
                    arg_type: arg.arg_type.clone(),
                    name: arg.name.clone(),
                })
                .collect();
        });

    let sketch_datas: Vec<SketchDataResponse> =
        repositories::sketch_data_repository::get_by_sketch_id(
            sketch.id,
            connection_str.0.as_str(),
        )
        .unwrap()
        .iter()
        .map(|data| SketchDataResponse {
            id: data.id,
            name: data.name.clone(),
            data_name: data.data_name.clone(),
            data_type: data.data_type.clone(),
        })
        .collect();

    Ok(dtos::MicroControllerSketch {
        id: sketch.id,
        name: sketch.name,
        code: sketch.code,
        params: sketch_param_responses,
        procedures: sketch_procedure_responses,
        datas: sketch_datas,
    })
}

#[tauri::command]
fn create_module(
    create_module_request: CreateModuleRequest,
    connection_str: tauri::State<DbConnection>,
) -> Result<(), String> {
    let module_id = repositories::module_repository::create(
        &models::Module {
            id: 0,
            name: create_module_request.name,
            file_name: create_module_request.file_name,
            code: create_module_request.code,
            description: create_module_request.description,
        },
        connection_str.0.as_str(),
    )
    .or(Err("Ошибка при добавлении модуля"))?;
    
    for module_command in create_module_request.commands {
        let module_command_id = repositories::module_command_repository::create(
            &models::ModuleCommand {
                id: 0,
                command_name: module_command.command_name,
                name: module_command.name,
                module_id: module_id,
            },
            connection_str.0.as_str(),
        )
        .or(Err("Ошибка при добавлении модуля"))?;

        for module_command_arg in module_command.args {
            repositories::module_command_arg_repository::create(
                &models::ModuleCommandArg {
                    id: 0,
                    arg_name: module_command_arg.arg_name,
                    arg_type: module_command_arg.arg_type,
                    name: module_command_arg.name,
                    module_command_id: module_command_id,
                },
                connection_str.0.as_str(),
            )
            .or(Err("Ошибка при добавлении модуля"))?;
        }
    }

    for module_data in create_module_request.data_requests {
        repositories::module_data_request_repository::create(
            &models::ModuleDataRequest {
                id: 0,
                data_request_name: module_data.data_request_name,
                data_request_type: module_data.data_request_type,
                name: module_data.name,
                module_id: module_id,
            },
            connection_str.0.as_str(),
        )
        .or(Err("Ошибка при добавлении модуля"))?;
    }

    Ok(())
}

#[tauri::command]
fn get_all_modules(
    connection_str: tauri::State<DbConnection>,
) -> Result<Vec<dtos::ModuleResponse>, String> {
    let modules = repositories::module_repository::get_all(connection_str.0.as_str())
        .or(Err("Ошибка при получении модуля"))?;

    let module_responses: Vec<dtos::ModuleResponse> = modules
        .iter()
        .map(|module| {
            let mut module_command_responses: Vec<ModuleCommandResponse> =
                repositories::module_command_repository::get_by_module_id(
                    module.id,
                    connection_str.0.as_str(),
                )
                .unwrap()
                .iter()
                .map(|command| ModuleCommandResponse {
                    id: command.id,
                    name: command.name.clone(),
                    command_name: command.command_name.clone(),
                    args: Vec::<ModuleCommandArgResponse>::new(),
                })
                .collect();

            module_command_responses
                .iter_mut()
                .for_each(|module_command| {
                    module_command.args =
                        repositories::module_command_arg_repository::get_by_command_id(
                            module_command.id,
                            connection_str.0.as_str(),
                        )
                        .unwrap()
                        .iter()
                        .map(|arg| ModuleCommandArgResponse {
                            id: arg.id,
                            arg_name: arg.arg_name.clone(),
                            arg_type: arg.arg_type.clone(),
                            name: arg.name.clone(),
                        })
                        .collect();
                });

            let module_data_request_responses: Vec<ModuleDataRequestResponse> =
                repositories::module_data_request_repository::get_by_module_id(
                    module.id,
                    connection_str.0.as_str(),
                )
                .unwrap()
                .iter()
                .map(|data| ModuleDataRequestResponse {
                    id: data.id,
                    name: data.name.clone(),
                    data_request_name: data.data_request_name.clone(),
                    data_request_type: data.data_request_type.clone(),
                })
                .collect();

            ModuleResponse {
                id: module.id,
                name: module.name.clone(),
                code: module.code.clone(),
                file_name: module.file_name.clone(),
                description: module.description.clone(),
                commands: module_command_responses,
                data_requests: module_data_request_responses,
            }
        })
        .collect();

    Ok(module_responses)
}

#[tauri::command]
fn delete_module_by_id(id: i64, connection_str: tauri::State<DbConnection>) -> Result<(), String> {
    repositories::module_repository::delete(id, connection_str.0.as_str()).or(Err("Ошибка удаления модуля"))?;
    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let current_exe_path = env::current_exe().expect("Failed to get current executable path");
    let exe_dir = current_exe_path
        .parent()
        .expect("Failed to get parent directory of executable");
    let db_path = exe_dir.join("main.db").to_str().unwrap().to_string();

    repository::sqlite::dbcontext::init(&db_path);

    tauri::Builder::default()
        .manage(DbConnection(db_path))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_sketch,
            get_saved_data,
            save_as_module,
            save_module,
            save_as_project,
            save_project,
            get_all_sketches_full_info,
            get_sketch_code_from_new_file,
            delete_sketch_by_id,
            get_micro_controller_sketch_by_id,
            create_module,
            get_all_modules,
            delete_module_by_id,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
