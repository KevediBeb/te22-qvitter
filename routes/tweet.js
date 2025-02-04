import express from "express"
import pool from "../db.js"

const router = express.Router()

router.get("/shit", async(req, res) => {
    const [users] = await pool
    .promise()
    .query(`SELECT * FROM users`)

    res.render("tweet.njk",{
        title: "Shit",
        users
    })
})

export default router