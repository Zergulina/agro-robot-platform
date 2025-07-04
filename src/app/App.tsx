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
import SelectSketchPage from "../pages/SelectSketchPage/SelectSketchPage";
import { SelectSketchContextProvider } from "../storage/SelectSketchContextProvider";
import { DescriptorContextProvider } from "../storage/DescriptiorContextProvider";
import { NewModuleContextProvider } from "../storage/NewModuleContextProvider";
import AddModulePage from "../pages/AddModulePage/AddModulePage";


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
      <NewModuleContextProvider>
        <SelectSketchContextProvider>
          <DescriptorContextProvider>
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
                  <Route path="module-manager" >
                    <Route index element={<ModuleManagerPage />} />
                    <Route path="add" element={<AddModulePage />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </DescriptorContextProvider>
        </SelectSketchContextProvider>
      </NewModuleContextProvider>
    </NewSketchContextProvider>
  );
}

export default App;
