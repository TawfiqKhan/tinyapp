const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  const templateVars = { shortURL, longURL }
  res.send(templateVars);
})
app.get('/urls/:urlId', (req, res) => {
  let shortURL = req.params.urlId;
  let longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL }
  res.render("urls_show", templateVars)
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars)
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  const a = 1;
  res.send(`a equals = ${a}`)
});

app.get("/fetch", (req, res) => {
  res.send(`a equals = ${a}`)
});

app.listen(PORT, () => {
  console.log(`Server is Listening to http://localhost:${PORT}`)
})

//Helper function

function generateRandomString() {
  let output = ''
  let charSet = 'abcdefghijklmnopqrstuvwxyz123456789'
  for (let i = 0; i < 7; i++) {
    output = output.concat(charSet[Math.floor(Math.random() * charSet.length - 1)])
  }
  return output;
}