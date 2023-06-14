// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { InjectedProviderConnect } from './InjectedProviderConnect'

export function App() {
  const providerConnect = new InjectedProviderConnect()
  
  return (
    <>
      <h1>
        Welcome the Remix dashboard 👋
      </h1>

      <div />
    </>
  );
}

export default App