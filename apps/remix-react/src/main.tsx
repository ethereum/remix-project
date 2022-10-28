import * as ReactDOM from "react-dom/client";
import {  TransactionDebugger } from '@remix-project/remix-debug'

import App from "./app/app";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<App />);
