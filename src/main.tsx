import { createRoot } from "react-dom/client";
import App from "./app/App";
import { initialiseTheme } from "./app/theme";
import "./styles/globals.css";

initialiseTheme();
createRoot(document.getElementById("root")!).render(<App />);
