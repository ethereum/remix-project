
// const demoProxyServerUrl = 'https://solcoder.remixproject.org';

// export const send: StreamSend = async (
//     prompt: string,
//     observer: StreamingAdapterObserver,
//     plugin: any,
// ) => {
//     const body = {"data": [prompt, 'solidity_answer', false,2000,0.9,0.8,50]};
//     const response = await axios(demoProxyServerUrl, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         data: JSON.stringify(body),
//     });

//     console.log(plugin);
//     const result = await plugin.call('remixAI', 'solidity_answer', prompt);

//     if (response.status !== 200) {
//         observer.error(new Error('Failed to connect to the server'));
//         return;
//     }

//     if (response.statusText !== "OK") {
//         return;
//     }

//     // Read a stream of server-sent events
//     // and feed them to the observer as they are being generated
//     // const reader = response.body.getReader();
//     // const textDecoder = new TextDecoder();

//     // while (true) {
//     //     const {value, done} = await reader.read();
//     //     if (done) {
//     //         break;
//     //     }

//     //     const content = textDecoder.decode(value);
//     //     if (content) {
//     //         observer.next(content);
//     //     }
//     // }

//     observer.next(response.data.data[0]);
//     observer.complete();
// };
