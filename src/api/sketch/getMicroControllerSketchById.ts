import { invoke } from "@tauri-apps/api/core";
import { MicroControllerSketch } from "../../types/api/sketch";

export const getMicroControllerSketchById = (id: number, setMicroControllerSketch : (value: MicroControllerSketch) => void) => {
    invoke<MicroControllerSketch>("get_micro_controller_sketch_by_id", {id}).then(sketch => setMicroControllerSketch(sketch));
}