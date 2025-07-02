import { invoke } from "@tauri-apps/api/core"

export const saveProject = (path: string, data: string) => {
    invoke("save_project", {path, data});
}