import { createRoot } from "react-dom/client";
import { initialiseEstateTheme } from "@sangeev/estate-ui";
import App from "./app/App";
import "./styles/globals.css";

initialiseEstateTheme();
createRoot(document.getElementById("root")!).render(<App />);
