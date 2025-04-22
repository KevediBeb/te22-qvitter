import express from "express"
import pool from "../db.js"
//import loggedInUserId from "../routes/index.js"

const router = express.Router()

router.get("/new", async(req, res) => {
    const [users] = await pool
    .promise()
    .query(`SELECT * FROM users`)

    //console.log(loggedInUserId)
    res.render("tweet.njk",{
        title: "Shit",
        users: alert(loggedInUserId)
    })
})

router.get("/:id/edit", async(req, res) => {
    const id = req.params.id
  if (!Number.isInteger(Number(id))) { return res.status(400).send("Invalid ID") }
  const [rows] = await pool.promise().query("SELECT * FROM tweet WHERE id = ?", [id])
  if (rows.length === 0) {
    return res.status(404).send("Shit not found")
  }
  res.render("edit.njk", { tweet: rows[0] })
})



export default router