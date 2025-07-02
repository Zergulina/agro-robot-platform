import { invoke } from "@tauri-apps/api/core";
import { CreateModuleRequest } from "../../types/api/module";

export const createModule = (createModuleRequest: CreateModuleRequest) => {
    invoke("create_module", {createModuleRequest});
}