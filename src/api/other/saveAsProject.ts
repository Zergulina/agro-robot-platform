import { invoke } from "@tauri-apps/api/core"

export const saveAsProject = (data: String, saveAsCallback: (path: string) => void) => {
    invoke<string>("save_as_project", {data}).then(path => saveAsCallback(path));
}