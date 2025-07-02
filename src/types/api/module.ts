export type CommandArg = {
    id: number;
    arg_name: string;
    arg_type: string;
    name: string;
}

export type ModuleCommand = {
    id: number,
    command_name: string,
    name: string,
    args: CommandArg[]
}

export type ModuleDataRequest = {
    id: number,
    data_request_name: string,
    data_request_type: string,
    name: string
}

export type Module = {
    id: number,
    name: string,
    file_name: string,
    code: string,
    description: string,
    commands: ModuleCommand[],
    data_requests: ModuleDataRequest[]
}

export type CreateModuleCommandArgRequest = {
    arg_name: string,
    arg_type: string,
    name: string
}

export type CreateModuleCommandRequest = {
    command_name: string,
    name: string,
    args: CreateModuleCommandArgRequest[]
}

export type CreateModuleDataRequestRequest = {
    data_request_name: string,
    data_request_type: string,
    name: string
}

export type CreateModuleRequest = {
    name: string,
    file_name: string,
    description: string,
    code: string,
    commands: CreateModuleCommandRequest [],
    data_requests: CreateModuleDataRequestRequest []
}