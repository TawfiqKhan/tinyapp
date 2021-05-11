const express = require("express");
const app = express();
const PORT = 3000;

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Get Requests

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/u/:urlId", (req, res)=> {
  let shortURL = req.params.urlId;
  if(!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.render("404")
  }
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
})

app.get('/urls/:urlId', (req, res) => {
  let shortURL = req.params.urlId;
  if(!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.render("404")
  }
  let longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL }
  res.render("urls_show", templateVars)
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars)
})

app.get('/', (req, res) => {
  res.redirect("/urls")
})

// Handling Delete Request

app.post('/urls/:id/delete', (req, res)=> {
  let id = req.params.id;
  delete urlDatabase[id];
  //After Deleting redirecting to Urls/Home Page.
  res.redirect("/urls")
})

// Post Request

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL]= longURL;
  const templateVars = { shortURL, longURL }
  res.redirect(`/urls/${shortURL}`);
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