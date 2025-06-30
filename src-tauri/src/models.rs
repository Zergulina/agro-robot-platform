#[derive(Debug)]
pub struct Sketch {
    pub id: i64,
    pub name: String,
    pub file_name: String,
    pub code: String,
    pub description: String
}
#[derive(Debug)]
pub struct SketchParam {
    pub id: i64,
    pub macros_name: String,
    pub default_value: String,
    pub name: String,
    pub regex: String,
    pub sketch_id: i64
}
#[derive(Debug)]
pub struct SketchParamValue {
    pub id: i64,
    pub value: String,
    pub sketch_param_id: i64
}
#[derive(Debug)]
pub struct SketchProcedure {
    pub id: i64, 
    pub procedure_name: String,
    pub name: String,
    pub sketch_id: i64
}
#[derive(Debug)]
pub struct SketchProcedureArg {
    pub id: i64,
    pub arg_name: String,
    pub arg_type: String,
    pub name: String,
    pub sketch_procedure_id: i64
}
#[derive(Debug)]
pub struct SketchData {
    pub id: i64,
    pub data_name: String,
    pub data_type: String,
    pub name: String,
    pub sketch_id: i64
}