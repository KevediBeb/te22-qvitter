import express from "express"
import pool from "../db.js"

const router = express.Router()

router.get("/", async(req, res) => {
    const [tweets] = await pool
    .promise()
    .query(`SELECT tweet.*, users.name FROM tweet JOIN users ON tweet.author_id = users.id  ORDER BY updated_at DESC;;`)

    res.render("index.njk",{
        title: "Home",
        tweets
    })
})

router.post('/', async (req, res) => {
    console.log(req.body)
    const {author_id, message} = req.body
  
    const [result] = await pool.promise().query('INSERT INTO tweet (author_id, message) VALUES (?, ?)', [author_id, message])
  
    //res.json(result)

    res.redirect("/")
  })

export default router