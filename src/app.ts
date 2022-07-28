import express from "express"
import { resolve } from "path"
import bodyParser from "body-parser";

const app = express();

app.use(express.static(resolve("./", "public")))

app.use(bodyParser.json())

app.get("/", (req, res) => void res.sendFile(resolve("./", "public", "index.html")))


const cache = new Map();


app.get("/pass", (req, res) => {
  const key = req.body.key;
  if (!key) {
    return res.sendStatus(400)
  }

  const pass = cache.get(key)
  if (!pass) {
    return res.sendStatus(404)
  }

  res.send(pass)
})


app.post("/pass", (req, res) => {
  console.log(req.body)

  const id = req.body.uuid
  const pass = req.body.hash

  if (!id || !pass) {
    return res.sendStatus(400)
  }

  cache.set(id, pass)

  res.sendStatus(201)
})


export default app;
