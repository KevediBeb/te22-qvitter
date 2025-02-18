import express from "express"
import pool from "../db.js"
import { body, matchedData, validationResult } from "express-validator"

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

router.post('/:id/delete', async (req, res) => {
    const id = [req.params.id]
    console.log(id)
    // vi rullar en egen check så att det är ett nummer
  if (!Number.isInteger(Number(id))) {
    return res.status(400).send("Invalid ID")
  }
    const [result] = await pool.promise().query('DELETE FROM `webbserver`.`tweet` WHERE (`id` = ?)', [id])
  
    res.redirect("/")
})

router.post("/:id/edit",
    body("id").isInt(),
    body("message").isLength({ min: 1, max: 130 }),
    body("message").escape(),
    async (req, res) => {
    const errors = validationResult(req)
    console.log(errors)
    if (!errors.isEmpty()) { return res.status(400).send("Invalid input") }
  
    const { id, message } = matchedData(req) // req.params.message varför inte?
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ")
    console.log(timestamp)
    await pool.promise().query("UPDATE tweet SET message = ?, updated_at = ? WHERE id = ?", [message, timestamp, id])
    res.redirect("/")
  })

export default router