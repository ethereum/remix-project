import * as ReactDOM from 'react-dom';
import { RemixUiXterminals } from './remix/ui/remix-ui-xterminals';
import { RemixUIFileDialog } from './remix/ui/remix-ui-filedialog';
import { xterm, filePanel } from './renderer';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('app');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <>
    <RemixUiXterminals plugin={xterm} />
    <RemixUIFileDialog plugin={filePanel} />
  </>
)