import { invoke } from "@tauri-apps/api/core"
import { LoadedFile } from "../../types/api/other"

export const loadFile = (loadCallback: (loadedFile: LoadedFile) => void) => {
    invoke<LoadedFile>("get_saved_data", {}).then(loadedFile => loadCallback(loadedFile));
}