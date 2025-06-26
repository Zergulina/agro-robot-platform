import { invoke } from "@tauri-apps/api/core";
import { CreateSketchRequest } from "../../types/api/sketch";

export const createSketch = (createSketchRequest: CreateSketchRequest) => {
    invoke("create_sketch", {createSketchRequest})
}