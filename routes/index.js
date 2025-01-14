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

export default router