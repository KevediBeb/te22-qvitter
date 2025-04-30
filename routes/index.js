import express from "express"
import session from "express-session"
import db from "../db-sqlite.js"
import { body, matchedData, validationResult } from "express-validator"
import bcrypt from "bcrypt"

const router = express.Router()

const saltRounds = 10;
const myPlaintextPassword = 'test';
const someOtherPlaintextPassword = 'not_bacon';

bcrypt.hash(myPlaintextPassword, 10, function(err, hash) {
	// här får vi nu tag i lösenordets hash i variabeln hash
	console.log(hash)
})

router.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { sameSite: true }
}))

var success = false
var loggedInUserName = ""
var loggedInUserId = -1 // tänker att man kollar om det är -1 och om det är -1 deny access

router.get("/", (req, res) => {
  res.redirect("/login")
})

router.get("/login", (req, res) => {
  if (req.session.views) {
    req.session.views++
  } else {
    req.session.views = 1
  }
  res.render("login.njk",
    { title: "Log in", message: "Funkar?", views: req.session.views }
  )
})

router.post('/login', async (req, res) => {
  
  console.log(req.body)
  
  const {name, password} = req.body
  const result = await db.get(`SELECT * FROM user WHERE name = ?`, name)
  
  //

  console.log(result)
  if(result !== undefined){
    console.log(result.password)
    bcrypt.compare(password, result.password, function(err, resul) {
      if(resul){
        
        success = true
        loggedInUserName = name
        loggedInUserId = result.id
        console.log("logged in user id: " + loggedInUserId)
        console.log("rätt, " + success)
      }else{
        
        success = false
        console.log("Wrong username or password, " + success)
      }
      console.log("final, " + success)
  if(success == true){
    res.redirect("/home")
  }else{
    res.redirect("/")
  }
    });
  }
  
  
  
  
})

router.get("/home", async(req, res) => {
  if(success == true){
    const tweets = await db.all(`SELECT tweet.*, user.name FROM tweet JOIN user ON tweet.author_id = user.id  ORDER BY updated_at DESC;;`)

    res.render("index.njk",{
        title: "Home",
        username: loggedInUserName,
        tweets
    })
  }else{
    console.log("NOT LOGGED IN!!!!")
    res.redirect("/")
  }
    
})

router.post('/home', async (req, res) => {
    console.log(req.body)
    const {author_id, message} = req.body
  
    await db.run("INSERT INTO tweet (author_id, message) VALUES (?, ?)", author_id , message)
  
    //res.json(result)

    res.redirect("/home")
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
export { loggedInUserId }