import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  }, []);

  // return "Frontend Connected";
}

export default App;
