import express from "express"
import db from "../db-sqlite.js"

const router = express.Router()

router.get("/new", async(req, res) => {
    const [users] = await db.all(`SELECT * FROM user`)

    // console.log(loggedInUserId)
    res.render("tweet.njk",{
        title: "Shit",
        user: req.session.userId
    })
})

router.get("/:id/edit", async(req, res) => {
  console.log("editing...")
    const id = req.params.id
  if (!Number.isInteger(Number(id))) { return res.status(400).send("Invalid ID") }
  const rows = await db.all("SELECT * FROM tweet WHERE id = ?", id)
  if (rows.length === 0) {
    return res.status(404).send("Shit not found")
  }
  res.render("edit.njk", { tweet: rows[0] })
})



export default router