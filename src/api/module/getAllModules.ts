import { invoke } from "@tauri-apps/api/core";
import { Module } from "../../types/api/module";

export const getAllModules = (setModules: (value: Module[]) => void) => {
    invoke<Module[]>("get_all_modules").then(res => {
        setModules(res);
    })
}