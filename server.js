const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 3000;

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

const users = {
  '363cko': { 
    id: '363cko', 
    email: 'sunnynchelsea@gmail.com', 
    password: 'avc' 
  }
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Get Requests

// Creating New Url

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { users });
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  const templateVars = { shortURL, longURL }
  res.redirect(`/urls/${shortURL}`);
})

// get request to Url's destination

app.get("/u/:urlId", (req, res) => {
  let shortURL = req.params.urlId;
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.render("404")
  }
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
})

// Handling get request for show Page
app.get('/urls/:urlId', (req, res) => {
  let username = req.cookies["username"]
  let shortURL = req.params.urlId;
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.render("404")
  }
  let longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL, username }
  res.render("urls_show", templateVars)
})

// Request for route/Urls page
app.get('/urls', (req, res) => {
  let username = req.cookies["username"]
  const templateVars = { urls: urlDatabase, username }
  res.render("urls_index", templateVars)
})

app.get('/', (req, res) => {
  res.redirect("/urls")
})

// Handling Delete Request

app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  //After Deleting redirecting to Urls/Home Page.
  res.redirect("/urls")
})

// Handing Edit Request

app.post('/urls/:id/edit', (req, res) => {
  let id = req.params.id;
  let updatedUrl = req.body.updatedUrl;
  urlDatabase[id] = updatedUrl;
  res.redirect("/urls");
})

//Login Route
app.post('/login', (req, res) => {
  res
    .cookie('username', req.body.username)
    .redirect("/urls");
})

//logout route
app.post('/logout', (req, res) => {
  res
    .clearCookie('username')
    .redirect("/urls")
})

//Register Route
app.get('/register', (req, res) => {
  let username = req.cookies["username"]
  res.render("register", { username })
})

app.post('/register', (req, res) => {
  const result = createUser(users, req.body);
  if (result.error) {
    res.send(result.error);
  }
  res.cookie("user_id", result.data["id"]);
  console.log(users, req.cookies)
  res.redirect("/urls");

})

// Server Creation
app.listen(PORT, () => {
  console.log(`Server is Listening to http://localhost:${PORT}`)
})

//Helper function

function generateRandomString() {
  let output = ''
  let charSet = 'abcdefghijklmnopqrstuvwxyz123456789'
  for (let i = 0; i < 7; i++) {
    output = output.concat(charSet[Math.floor(Math.random() * (charSet.length - 1))])
  }
  return output;
}

function createUser(usersDb, body) {
  const id = Math.random().toString(36).substring(2, 8);
  const { email, password } = body;
  if (body[id]) {
    return { data: null, error: "User already exist!" }
  }
  if (!email || !password) {
    return { data: null, error: "Invalid Fields" }
  }
  users[id] = { id, email, password };
  return { data: users[id], error: null }
}