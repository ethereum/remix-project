import { publish } from './publisher';

const open = require('open')

jest.setTimeout(10000)

describe('Publisher tests', () => {

    test('it can publish', async () => {
        const result = await publish("hello 123")

        expect(result).toBeDefined()
    })

    test('it can publish html', async () => {
        const result = await publish(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="utf-8" />
            <meta
                name="description"
                content="Web site created using create-react-app"
            />
            </head>
            <body>
                <div>Content custom</div>
            </body>
            </html>
        `)

        // Uncomment for testing

        // const url = `https://ipfs.io/ipfs/${result}`;

        // await open(url, { app: ['google chrome', '--incognito'] });

        expect(result).toBeDefined()
    })
})
