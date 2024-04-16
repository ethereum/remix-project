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

describe('completion', () => {
    it('should retrieve data from completion and check content', async () => {
        const postData = {
            data: [
                "pragma solidity 0.8.0 //function add 3 numbers\n",
                "code_completion",
                "",
                false,
                200,
                1,
                0.8,
                50
            ]
        };

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000,  // total request time including connection setup
        };

        const response = await axiosInstance.post(`${API_URL}/completion/`, postData, config)
        console.log(response.data);
        chai.expect(response.data.data[0]).to.contains('function add');
        chai.expect(response.data.is_generating).to.equal(false);
    });
})