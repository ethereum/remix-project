import chai from 'chai';
import axios from 'axios';
import { describe, it } from 'mocha';
import https from 'https';

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // This will ignore SSL certificate errors
  })
});

const API_URL = 'https://127.0.0.1:1025';

describe('solcoder', () => {
    it('should retrieve data from solcoder and check content', async () => { 
    });
})