import chai from 'chai';
import axios from 'axios';
import { describe, it } from 'mocha';
import https from 'https';



describe('IPFS', () => {
  it('should retrieve data from IPFS and check content', async () => { // Define a test case with 'it'
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // This will ignore SSL certificate errors
      })
    });

    try {
      const res = await axiosInstance.get('/jqgt/ipfs/QmcuCKyokk9Z6f65ADAADNiS2R2xCjfRkv7mYBSWDwtA7M');
      console.log(res.data);
      chai.expect(res.data).to.contains('greeting'); // Ensure this matches the actual expected content
      chai.expect(res.status).to.equal(200);
    } catch (err: any) {
      // If an error occurs, we throw it to make the test fail
      throw new Error(`Request failed: ${err.message}`);
    }
  });
});

describe('OpenAI GPT Remix Project API Test', function() {
  this.timeout(10000); // Increase the Mocha timeout for this test

  it('should return a successful response from the API', async function() {
    // Perform the Axios request
    const response = await axios.post('/openai-gpt/', {
      prompt: 'Hello, my name is John and I am a'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000,
    });

    chai.expect(response.data.choices[0].message.role).to.equal('assistant'); // Ensure this matches
    chai.expect(response.status).to.equal(200);

  });
});
