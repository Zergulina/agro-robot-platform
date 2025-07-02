import { invoke } from "@tauri-apps/api/core"

export const deleteModuleById = (id: number, deleteCallback: () => void) => {
    invoke("delete_module_by_id", {id}).then(() => deleteCallback());
}