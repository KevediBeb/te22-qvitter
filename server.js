import "dotenv/config"
import express from "express"
import nunjucks from "nunjucks"
import indexRouter from "./routes/index.js"


const app = express()

const port = 3000

app.use(express.static('public'))



nunjucks.configure("views", {
    autoescape: true,
    express: app,
    
})

app.use("/", indexRouter)


app.listen(port, () => {
    console.log("Server is running on http://localhost:3000")
})