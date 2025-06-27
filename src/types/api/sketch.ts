export type SketchParamValue = {
    id: number;
    value: string;
}

export type SketchParam = {
    id: number;
    macros_name: string,
    default_value: string,
    name: string
    regex: string
    value_list: SketchParamValue[];
}

export type SketchProcedureArg = {
    id: number;
    arg_name: string;
    arg_type: string;
    name: string;
}

export type SketchProcedure = {
    id: number;
    procedure_name: string;
    name: string;
    args: SketchProcedureArg[];
}

export type SketchData = {
    id: number;
    data_name: string;
    data_type: string;
    name: string;
}

export type SketchFullInfo = {
    id: number;
    name: string;
    file_name: string;
    description: string;
    params: SketchParam[];
    procedures: SketchProcedure[];
    datas: SketchData[];
}

export type MicroControllerSketch = {
    id: number;
    name: string;
    code: string;
    params: SketchParam[];
    procedures: SketchProcedure[];
    datas: SketchData[];
}

export type CreateSketchParamValueRequest = {
    value: string;
}

export type CreateSketchParamRequest = {
    macros_name: string,
    default_value: string,
    name: string
    regex: string
    value_list: CreateSketchParamValueRequest[];
}

export type CreateSketchProcedureArgRequest = {
    arg_name: string;
    arg_type: string;
    name: string;
}

export type CreateSketchProcedureRequest = {
    procedure_name: string;
    name: string;
    args: CreateSketchProcedureArgRequest[];
}

export type CreateSketchDataRequest = {
    data_name: string;
    data_type: string;
    name: string;
}

export type CreateSketchRequest = {
    name: string;
    file_name: string;
    description: string;
    code: string;
    params: CreateSketchParamRequest[];
    procedures: CreateSketchProcedureRequest[];
    datas: CreateSketchDataRequest[];
}