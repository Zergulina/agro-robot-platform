import { invoke } from "@tauri-apps/api/core"

export const saveModule = (path: string, data: string) => {
    invoke("save_module", {path, data});
}