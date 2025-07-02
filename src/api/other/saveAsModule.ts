import { invoke } from "@tauri-apps/api/core"

export const saveAsModule = (data: string, saveAsCallback: (path: string) => void) => {
    invoke<string>("save_as_module", {data}).then(path => saveAsCallback(path));
}