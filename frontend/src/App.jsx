import { Routes, Route } from "react-router-dom";
import { Provider, useStore } from "./store.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Workspace from "./pages/Workspace.jsx";
import History from "./pages/History.jsx";
function Shell() {
  const { min } = useStore();
  return (
    <>
      <Sidebar />
      <main
        className={`min-h-screen px-4 pb-12 pt-16 transition-[margin] lg:px-8 lg:pt-8 ${min ? "lg:ml-[72px]" : "lg:ml-64"}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </>
  );
}
export default function App() {
  return (
    <Provider>
      <Shell />
    </Provider>
  );
}
