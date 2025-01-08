import GameOver from "./components/Game-Over";
import SurfaceWithUser from "./components/Surface-User/Surface-User";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<SurfaceWithUser />} />
        <Route path="/exit" element={<GameOver />} />
      </Routes>
    </div>
  );
}

export default App;
