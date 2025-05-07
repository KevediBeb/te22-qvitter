import express from "express"
import session from "express-session"
import db from "../db-sqlite.js"
import { body, matchedData, validationResult } from "express-validator"
import bcrypt from "bcrypt"

const router = express.Router()

const saltRounds = 10;
const myPlaintextPassword = 'doejohn';
const someOtherPlaintextPassword = 'not_bacon';

bcrypt.hash(myPlaintextPassword, 10, function(err, hash) {
	// här får vi nu tag i lösenordets hash i variabeln hash
	//console.log(hash)
})

router.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: { sameSite: true }
}))

var userExist = false
var success = false
var loggedInUserName = ""
var loggedInUserId = -1 // tänker att man kollar om det är -1 och om det är -1 deny access

router.get("/", (req, res) => {
  if(success == true && loggedInUserId > -1){
    res.redirect("/home")
  }else{
    res.redirect("/login")
  }
  
})

router.post("/", (req, res) => {
  success = false
  loggedInUserId = -1
  res.redirect("/")
})

router.get("/login", (req, res) => {
  if (req.session.views) {
    req.session.views++
  } else {
    req.session.views = 1
  }
  var msg = ""
  if(success == false){
    if(req.session.views == 1){
      msg = "Funkar?"
    }else{
      msg = "Wrong username or password or you just created an account idk"
    }
  }else{
    msg = "Funkar?"
  }
  res.render("login.njk",
    { title: "Log in", message: msg, views: req.session.views }
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
        success = true
        loggedInUserName = name
        res.redirect("/home")
      }else{
        success = false
        res.redirect("/");
      }
    });
    
  }
  
  
  
  
  
  
})

router.get("/account/new", (req, res) => {
  if (req.session.views) {
    req.session.views++
  } else {
    req.session.views = 1
  }
  var msg = "Register account"
  if(userExist == false){
    msg = "Register account"
  }else{
    msg = "Username already taken bumass"
    userExist = false
  }
  
  
  res.render("account_create.njk",
    { title: "Account creation", message: msg, views: req.session.views }
  )
})

router.post('/account/new', async (req, res) => {
  
  var red = "/"

  console.log(req.body)
  
  const {name, password} = req.body

  const result = await db.get(`SELECT * FROM user WHERE name = ?`, name)

  var pass = ""
  bcrypt.hash(password, 10, function(err, hash) {
    console.log(hash)
    pass = hash
    console.log(password)
  })

  var check = function(){
    if(pass != ""){
      if(result === undefined){
        db.run('INSERT INTO user (name, password) VALUES (?, ?)', name, pass)
        console.log("ACCOUNT CREATED FOR " + name)
      }else{
        userExist = true
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



router.get("/home", async(req, res) => {
  if(success == true && loggedInUserId > -1){
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
  if(success == true && loggedInUserId > -1){
    const id = [req.params.id]
    console.log(id)
    // vi rullar en egen check så att det är ett nummer
  if (!Number.isInteger(Number(id))) {
    return res.status(400).send("Invalid ID")
  }
    const result = await db.get('DELETE FROM tweet WHERE id = ?', id)
  
    
  }else{
    console.log("NOT LOGGED IN!!!!")
    
  }
  res.redirect("/")
    
})

router.post("/:id/edit",
    body("id").isInt(),
    body("message").isLength({ min: 1, max: 130 }),
    body("message").escape(),
    async (req, res) => {
      if(success == true && loggedInUserId > -1){
        console.log("editing... for real this time")
        const errors = validationResult(req)
    console.log(errors)
    if (!errors.isEmpty()) { return res.status(400).send("Invalid input") }
  
    const { id, message } = matchedData(req) // req.params.message varför inte?
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ")
    console.log(timestamp)
    await db.run("UPDATE tweet SET message = ?, updated_at = ? WHERE id = ?", message, timestamp, id)
    
      }else{
        console.log("NOT LOGGED IN!!!!")
        
      }
      res.redirect("/")
    
  })

export default router
export { loggedInUserId }