import { invoke } from "@tauri-apps/api/core"

export const deleteSketchById = (id: number, deleteCallback: () => void) => {
    invoke("delete_sketch_by_id", {id}).then(() => deleteCallback());
}