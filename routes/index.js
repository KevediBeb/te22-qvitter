import express from "express"
import pool from "../db.js"

const router = express.Router()

router.get("/", async(req, res) => {
    const [tweets] = await pool
    .promise()
    .query(`SELECT tweet.*, users.name FROM tweet JOIN users ON tweet.author_id = users.id;`)

    res.render("index.njk",{
        title: "issnics",
        tweets
    })
})

export default router