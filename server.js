import "dotenv/config"
import express from "express"
import nunjucks from "nunjucks"
import bodyParser from "body-parser"
import indexRouter from "./routes/index.js"
import tweetRouter from "./routes/tweet.js"


const app = express()

const port = 3000

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

nunjucks.configure("views", {
    autoescape: true,
    express: app,
    
})

app.use("/", indexRouter)
app.use("/", tweetRouter)


app.listen(port, () => {
    console.log("Server is running on http://localhost:3000")
})