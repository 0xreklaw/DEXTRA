import { Link } from "react-router-dom";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div>
        <h2 style={{ textAlign: "center" }}>Dextra</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Link
            to="/imitation"
            style={{ margin: "0 10px", textDecoration: "none", color: "blue" }}
          >
            <p>Imitation</p>
          </Link>

          <Link
            to="/manual"
            style={{ margin: "0 10px", textDecoration: "none", color: "blue" }}
          >
            <p>Manual</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
