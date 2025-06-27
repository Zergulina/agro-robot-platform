import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppTitle from "../modules/AppTitle/AppTitle";
import "./theme/dark.css"
import "./theme/light.css"
import { useEffect } from "react";
import WorkPage from "../pages/WorkPage/WorkPage";
import OptionalAppTitle from "../modules/InstrumentAppTitle/OptionalAppTitle";
import SketchManagerPage from "../pages/SketchManagerPage/SketchManagerPage";
import ModuleManagerPage from "../pages/ModuleManagerPage/ModuleManagerPage";
import AddSketchPage from "../pages/AddSketchPage/AddSketchPage";
import { NewSketchContextProvider } from "../storage/NewSketchContextProvider";
import { MicroControllerProvider } from "../storage/SelectedMicroControllerProvider";
import SelectSketchPage from "../pages/SelectSketchPage/SelectSketchPage";


function App() {
  const handleContextMenu = (e: Event) => {
    e.preventDefault();
  }

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])


  return (
    <NewSketchContextProvider>
      <MicroControllerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppTitle />}>
              <Route index element={<WorkPage />} />
            </Route>
            <Route path="optional" element={<OptionalAppTitle />}>
              <Route path="sketch-manager">
                <Route index element={<SketchManagerPage />} />
                <Route path="add" element={<AddSketchPage />} />
                <Route path="select" element={<SelectSketchPage />} />
              </Route>
              <Route path="module-manager" element={<ModuleManagerPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MicroControllerProvider>
    </NewSketchContextProvider>
  );
}

export default App;
