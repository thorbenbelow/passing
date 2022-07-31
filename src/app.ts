import express from "express"
import { resolve } from "path"
import bodyParser from "body-parser";

const app = express();

app.use(express.static(resolve("./", "public")))
app.use(bodyParser.json())

app.get("/", (req, res) => void res.sendFile(resolve("./", "public", "index.html")))

const cache = new Map();

app.get("/pass", (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.sendStatus(400)
  }

  const pair = cache.get(id)
  if (!pair) {
    return res.sendStatus(404)
  }

  res.json(pair)
})


app.post("/pass", (req, res) => {
  const id = req.body.uuid
  const hash = req.body.hash
  const counter = req.body.counter

  if (!id || !hash || !counter) {
    return res.sendStatus(400)
  }

  cache.set(id, { hash, counter })

  res.sendStatus(201)
})


export default app;
