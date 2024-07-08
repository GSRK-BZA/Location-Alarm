import Alarm from "./components/Alarm/Alarm";
import Alarms from "./components/Alarms/Alarms";
import Map from "./components/Map/Map";
import "./App.css";
function App() {
  return (
    <div className="App">
      <Map />
      <Alarms />
    </div>
  );
}

export default App;
