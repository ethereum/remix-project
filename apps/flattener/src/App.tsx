import { useBehaviorSubject } from "./usesubscribe";
import "./App.css";
import { FlattenerPlugin } from "./Client";
import { Button } from "react-bootstrap";

export const client = new FlattenerPlugin();

function App() {
  const log = useBehaviorSubject(client.feedback);
  const fileName = useBehaviorSubject(client.fileName);
  const flatFileName = useBehaviorSubject(client.flatFileName);
  return (
    <div className="App p-3">
      <div>
        Select a contract, compile it, then get the flattened version by pressing the button.
        Flattened source code will be copied to the clipboard.
      </div>

      {fileName ?
        <div>
          <Button className='btn-sm w-100' onClick={async () => await client.flatten(null)}>Flatten {fileName}</Button>
          <div>
            You can save the flattened version to the file inside Remix.
          </div>
          <Button className='btn-sm w-100' onClick={async () => await client.save()}>Save {flatFileName}</Button>
        </div> : <div></div>}
      <div>{log}</div>
    </div>
  );
}

export default App;
