import chai from 'chai';
import axios from 'axios';
import { describe, it } from 'mocha';
import https from 'https';
import fs from 'fs';

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // This will ignore SSL certificate errors
  })
});

const API_URL = 'https://127.0.0.1:1025';

describe('solidityscan', () => {
  it('should retrieve data from solidityscan and check content', async () => { // Define a test case with 'it'

    const fileName = 'test/testdata/Example.sol'
    const file = fs.readFileSync(fileName, 'utf-8')

    try {
      
      const urlResponse = await axiosInstance.post(`${API_URL}/solidityscan`, {
        file,
        fileName
      });

      console.log(urlResponse.data);

      chai.expect(urlResponse.status).to.equal(200);
      chai.expect(urlResponse.data).not.to.be.empty;
      chai.expect(urlResponse.data).to.be.an('object');
      chai.expect(urlResponse.data).to.have.property('status');
      chai.expect(urlResponse.data).to.have.property('result');
      chai.expect(urlResponse.data.result).to.have.property('url');
      chai.expect(urlResponse.data.result.url).to.contain('s3');
      
    } catch (err: any) {
      // If an error occurs, we throw it to make the test fail
      throw new Error(`Request failed: ${err.message}`);
    }
  });
});