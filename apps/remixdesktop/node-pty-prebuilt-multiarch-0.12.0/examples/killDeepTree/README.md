This is a manual test to verify deeply nested trees are getting killed correctly on Windows.

To run:

```bash
npm i
node index.js
```

It should launch a notepad window and a webpack dev server, after 10 seconds the webpack dev server should be killed and the notepad instance should not. To verify the server is kill correctly either run the test again or check using ProcessExplorer.
