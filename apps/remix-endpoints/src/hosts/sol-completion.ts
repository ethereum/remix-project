import express from 'express';
import cors from 'cors'
import axio from 'axios'

export const solcompletion = () => {
  const app = express()
  const ips = new Map<string, number>()
  app.use(cors())
  app.post('/', async (req: any, res: any, next: any) => {
    const prompt = req.body.data[0]
    const task = req.body.data[1]
    const params = req.body.data.slice(2, req.body.data.length)
    const result = await axio.post( "https://v4epedllnaipwu-7860.proxy.runpod.net/ai/api/".concat(task),
      JSON.stringify(task==="code_completion") ? 
        {"data":[prompt,params[0], params[1], params[2], params[3], params[4], params[5]]} :
        {"data":[prompt,params[0], params[1], params[2], params[3], params[4]]} 
    )

    const response = result.data
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
    next()
  })
  return app
}
