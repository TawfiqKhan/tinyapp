const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 3000;

const { generateRandomString, createUser, checkUser, fetchUser } = require("./helpers/userHelpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "sunnynchelsea@gmail.com",
    password: "abc"
  },

  aJ4256: {
    id: "aJ4256",
    email: "special3220@yahoo.com",
    password: "abc"
  },
};

const urlDatabase = {
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3CoBr: { longURL: "https://bbc.co.uk", userID: "aJ48lW" },
  i3abcd: { longURL: "http://footiemanager.com", userID: "aJ4256" },
  i3efgh: { longURL: "https://dailymail.com", userID: "aJ4256" },
};


// Get Requests


// Ask users to login or register to view urls

// if logged in, only show their own urls


// Creating New Url

app.get("/urls/new", (req, res) => {
  const user = fetchUser(users, req.cookies);
  if (!user) {
    res.redirect("/login");
  }
  res.render("urls_new", { user });
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  let userID = req.cookies["user_id"]
  urlDatabase[shortURL] = { longURL, userID };
  // const templateVars = { shortURL, longURL };
  res.redirect(`/urls/${shortURL}`);
});

// get request to Url's destination

app.get("/u/:urlId", (req, res) => {
  let shortURL = req.params.urlId;
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.render("404");
  }
  let longURL = urlDatabase[shortURL]["longURL"];
  res.redirect(longURL);
});

// Handling get request for show Page
app.get('/urls/:urlId', (req, res) => {
  const user = fetchUser(users, req.cookies);
  let shortURL = req.params.urlId;
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.render("404");
  }
  let longURL = urlDatabase[shortURL]["longURL"];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

// Request for route/Urls page
app.get('/urls', (req, res) => {
  const user = fetchUser(users, req.cookies);
  if (user && user.id) {
    let filteredUrls = urlsForUser(user.id, urlDatabase);
    const templateVars = { urls: filteredUrls, user };
    return res.render("urls_index", templateVars)
  }
  res.render("urls_index", {user});
});

app.get('/', (req, res) => {
  res.redirect("/urls");
});

// Handling Delete Request

app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  //After Deleting redirecting to Urls/Home Page.
  res.redirect("/urls");
});

// Handing Edit Request

app.post('/urls/:id/edit', (req, res) => {
  let id = req.params.id;
  let updatedUrl = req.body.updatedUrl;
  urlDatabase[id]["longURL"] = updatedUrl;
  res.redirect("/urls");
});

//Login Route
app.get('/login', (req, res) => {
  const user = fetchUser(users, req.cookies);
  res.render("login", { user });
});

app.post('/login', (req, res) => {
  let user = checkUser(users, req.body);
  if (user) {
    let inputPassword = req.body.password;
    if (user.password === inputPassword) {
      res.cookie("user_id", user.id);
      return res.redirect('urls');
    } else {
      res.statusCode = 403;
      return res.send("wrong email/password, try again.");
    }
  }
  res.statusCode = 403;
  res.send("wrong email/password, try again.");
});

//logout route
app.post('/logout', (req, res) => {
  res
    .clearCookie('user_id')
    .redirect("/urls");
});

//Register Route
app.get('/register', (req, res) => {
  const user = fetchUser(users, req.cookies);
  res.render("register", { user });
});

app.post('/register', (req, res) => {
  const result = createUser(users, req.body);
  if (result.error) {
    res.statusCode = 400;
    return res.send(result.error);
  }
  res.cookie("user_id", result.user["id"]);
  res.redirect("/urls");
});

// Server Creation
app.listen(PORT, () => {
  console.log(`Server is Listening to http://localhost:${PORT}`);
});

//>>>>>>>>   Helper function <<<<<<<<//

function urlsForUser(id, urlDB) {
  const filteredUrls = {};
  const keys = Object.keys(urlDB);
  for (let item of keys) {
    if (urlDB[item]["userID"] === id) {
      filteredUrls[item] = urlDB[item];
    }
  }
  return filteredUrls;
}