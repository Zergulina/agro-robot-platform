import { invoke } from "@tauri-apps/api/core"
import { SketchFullInfo } from "../../types/api/sketch"

export const getAllSketchesFullInfo = (setSketchesFullInfo: (value: SketchFullInfo[]) => void) => {
    invoke<SketchFullInfo[]>("get_all_sketches_full_info").then(res => {
        setSketchesFullInfo(res);
    })
}