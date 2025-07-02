use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct NewSketchFile {
    pub code: String,
    pub file_name: String,
}

#[derive(Deserialize)]
pub struct CreateSketchParamValueRequest {
    pub value: String,
}

#[derive(Deserialize)]
pub struct CreateSketchParamRequest {
    pub macros_name: String,
    pub default_value: String,
    pub name: String,
    pub regex: String,
    pub value_list: Vec<CreateSketchParamValueRequest>,
}

#[derive(Deserialize)]
pub struct CreateSketchProcedureArgRequest {
    pub arg_name: String,
    pub arg_type: String,
    pub name: String,
}

#[derive(Deserialize)]
pub struct CreateSketchProcedureRequest {
    pub procedure_name: String,
    pub name: String,
    pub args: Vec<CreateSketchProcedureArgRequest>,
}

#[derive(Deserialize)]
pub struct CreateSketchDataRequest {
    pub data_name: String,
    pub data_type: String,
    pub name: String,
}

#[derive(Deserialize)]
pub struct CreateSketchRequest {
    pub name: String,
    pub file_name: String,
    pub description: String,
    pub code: String,
    pub params: Vec<CreateSketchParamRequest>,
    pub procedures: Vec<CreateSketchProcedureRequest>,
    pub datas: Vec<CreateSketchDataRequest>,
}

#[derive(Serialize)]
pub struct SketchParamValueResponse {
    pub id: i64,
    pub value: String,
}

#[derive(Serialize)]
pub struct SketchParamResponse {
    pub id: i64,
    pub macros_name: String,
    pub default_value: String,
    pub name: String,
    pub regex: String,
    pub value_list: Vec<SketchParamValueResponse>,
}

#[derive(Serialize)]
pub struct SketchProcedureArgResponse {
    pub id: i64,
    pub arg_name: String,
    pub arg_type: String,
    pub name: String,
}

#[derive(Serialize)]
pub struct SketchProcedureResponse {
    pub id: i64,
    pub procedure_name: String,
    pub name: String,
    pub args: Vec<SketchProcedureArgResponse>,
}

#[derive(Serialize)]
pub struct SketchDataResponse {
    pub id: i64,
    pub data_name: String,
    pub data_type: String,
    pub name: String,
}

#[derive(Serialize)]
pub struct SketchFullInfo {
    pub id: i64,
    pub name: String,
    pub file_name: String,
    pub description: String,
    pub params: Vec<SketchParamResponse>,
    pub procedures: Vec<SketchProcedureResponse>,
    pub datas: Vec<SketchDataResponse>,
}

#[derive(Serialize)]
pub struct MicroControllerSketch {
    pub id: i64,
    pub name: String,
    pub code: String,
    pub params: Vec<SketchParamResponse>,
    pub procedures: Vec<SketchProcedureResponse>,
    pub datas: Vec<SketchDataResponse>,
}

#[derive(Serialize)]
pub struct LoadedFile {
    pub path: String,
    pub data: String,
}


#[derive(Deserialize)]
pub struct CreateModuleCommandArgRequest {
    pub arg_name: String,
    pub arg_type: String,
    pub name: String,
}

#[derive(Deserialize)]
pub struct CreateModuleCommandRequest {
    pub command_name: String,
    pub name: String,
    pub args: Vec<CreateModuleCommandArgRequest>,
}

#[derive(Deserialize)]
pub struct CreateModuleDataRequestRequest {
    pub data_request_name: String,
    pub data_request_type: String,
    pub name: String,
}

#[derive(Deserialize)]
pub struct CreateModuleRequest {
    pub name: String,
    pub file_name: String,
    pub description: String,
    pub code: String,
    pub commands: Vec<CreateModuleCommandRequest>,
    pub data_requests: Vec<CreateModuleDataRequestRequest>,
}

#[derive(Serialize)]
pub struct ModuleCommandArgResponse {
    pub id: i64,
    pub arg_name: String,
    pub arg_type: String,
    pub name: String,
}

#[derive(Serialize)]
pub struct ModuleCommandResponse {
    pub id: i64,
    pub command_name: String,
    pub name: String,
    pub args: Vec<ModuleCommandArgResponse>,
}

#[derive(Serialize)]
pub struct ModuleDataRequestResponse {
    pub id: i64,
    pub data_request_name: String,
    pub data_request_type: String,
    pub name: String,
}

#[derive(Serialize)]
pub struct ModuleResponse {
    pub id: i64,
    pub name: String,
    pub file_name: String,
    pub code: String,
    pub description: String,
    pub commands: Vec<ModuleCommandResponse>,
    pub data_requests: Vec<ModuleDataRequestResponse>,
}