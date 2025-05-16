import express from "express"

import db from "../db-sqlite.js"
import { body, matchedData, validationResult } from "express-validator"
import bcrypt from "bcrypt"

const router = express.Router()



//var userExist = false
// var success = false
// var loggedInUserName = ""
// var loggedInUserId = -1 // tänker att man kollar om det är -1 och om det är -1 deny access

router.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/home")
  } else {
    res.redirect("/login")
  }

})

router.post("/", (req, res) => {
  req.session.username = undefined
  req.session.userId = undefined
  req.session.destroy()
  res.redirect("/")
})

router.get("/login", (req, res) => {
  if (req.session.views) {
    req.session.views++
  } else {
    req.session.views = 1
  }
  var msg = "Log into existing account"
  if(req.session.views > 0){
    msg = "Wrong username or password"
  }
  res.render("login.njk",
    { title: "Log in", message: msg }
  )
})

router.post('/login', async (req, res) => {

  console.log(req.body)

  const { name, password } = req.body
  const userExists = await db.get(`SELECT * FROM user WHERE name = ?`, name)

  console.log(userExists)
  if (userExists !== undefined) {
    console.log(userExists.password)
    bcrypt.compare(password, userExists.password, function (err, result) {
      if (result) {
        req.session.userId = userExists.id
        req.session.username = userExists.name
        return res.redirect("/home")
      } else {
        console.log("Wrong username or password")
        return res.redirect("/login")
      }
    });
  }else{
    return res.redirect("/login")
  }
})

router.get("/account/new", (req, res) => {
  if (req.session.views) {
    req.session.views++
  } else {
    req.session.views = 1
  }
  var msg = "Register account"
  
  if(req.session.views > 0){
    msg = "Username already exists"
  }


  res.render("account_create.njk",
    { title: "Account creation", message: msg, views: req.session.views }
  )
})

router.post('/account/new', async (req, res) => {

  var red = "/account/new"

  console.log(req.body)

  const { name, password } = req.body

  const result = await db.get(`SELECT * FROM user WHERE name = ?`, name)

  var pass = ""
  bcrypt.hash(password, 10, function (err, hash) {
    console.log(hash)
    pass = hash
    console.log(password)
  })

  var check = function () {
    if (pass != "") {
      if (result === undefined) {
        db.run('INSERT INTO user (name, password) VALUES (?, ?)', name, pass)
        console.log("ACCOUNT CREATED FOR " + name)
        red = "/"
      } else {
        //userExist = true
        console.log("User already exist bum ass!!")
        red = "/account/new"
      }
      res.redirect(red)

    }
    else {
      setTimeout(check, 100);
    }
  }

  check();


})



router.get("/home", async (req, res) => {
  if (req.session.userId !== undefined) {
    const tweets = await db.all(`SELECT tweet.*, user.name FROM tweet JOIN user ON tweet.author_id = user.id  ORDER BY updated_at DESC;;`)

    res.render("index.njk", {
      title: "Home",
      username: req.session.username,
      tweets,
      likes: tweets.likes
    })
  } else {
    console.log("NOT LOGGED IN!!!!")
    res.redirect("/")
  }

})

router.post('/home', async (req, res) => {
  console.log(req.body)
  const { author_id, message } = req.body

  await db.run("INSERT INTO tweet (author_id, message) VALUES (?, ?)", author_id, message)

  //res.json(result)

  res.redirect("/home")
})

router.post('/:id/delete', async (req, res) => {
  if (req.session.userId !== undefined) {
    const id = [req.params.id]
    console.log(id)
    // vi rullar en egen check så att det är ett nummer
    if (!Number.isInteger(Number(id))) {
      return res.status(400).send("Invalid ID")
    }
    const result = await db.get('DELETE FROM tweet WHERE id = ?', id)


  } else {
    console.log("NOT LOGGED IN!!!!")

  }
  res.redirect("/")

})

router.post('/:id/like', async (req, res) => {
  if (req.session.userId !== undefined) {
    const id = req.params.id
    console.log(id)


    const result = await db.run('UPDATE tweet SET likes = likes + 1 WHERE id = ?', id)

    console.log(result)

  } else {
    console.log("NOT LOGGED IN!!!!")

  }
  res.redirect("/")

})

router.post("/:id/edit",
  body("id").isInt(),
  body("message").isLength({ min: 1, max: 130 }),
  body("message").escape(),
  async (req, res) => {
    if (req.session.userId !== undefined) {
      console.log("editing... for real this time")
      const errors = validationResult(req)
      console.log(errors)
      if (!errors.isEmpty()) { return res.status(400).send("Invalid input") }

      const { id, message } = matchedData(req) // req.params.message varför inte?
      const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ")
      console.log(timestamp)
      await db.run("UPDATE tweet SET message = ?, updated_at = ? WHERE id = ?", message, timestamp, id)

    } else {
      console.log("NOT LOGGED IN!!!!")

    }
    res.redirect("/")

  })

export default router
