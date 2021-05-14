const express = require("express");
const app = express();
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session')
const PORT = 3000;
const bcrypt = require('bcrypt');

const { generateRandomString, createUser, checkUser, fetchUser } = require("./helpers/userHelpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// Cookie Session Middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const users = {
  // aJ48lW: {
  //   id: "aJ48lW",
  //   email: "sunnynchelsea@gmail.com",
  //   hashedPassword: "abc"
  // },

  // aJ4256: {
  //   id: "aJ4256",
  //   email: "special3220@yahoo.com",
  //   hashedPassword: "abc"
  // },
};

const urlDatabase = {
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  // i3CoBr: { longURL: "https://bbc.co.uk", userID: "aJ48lW" },
  // i3abcd: { longURL: "http://footiemanager.com", userID: "aJ4256" },
  // i3efgh: { longURL: "https://dailymail.com", userID: "aJ4256" },
};


// Get Requests

// Creating New Url

app.get("/urls/new", (req, res) => {
  const user = fetchUser(users, req.session);
  if (!user) {
    res.redirect("/login");
  }
  res.render("urls_new", { user });
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  let userID = req.session["user_id"]
  urlDatabase[shortURL] = { longURL, userID };
  // const templateVars = { shortURL, longURL };
  res.redirect(`/urls/${shortURL}`);
});

// get request to Url's destination

app.get("/u/:id", (req, res) => {
  let shortURL = req.params.urlId;
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.render("404");
  }
  let longURL = urlDatabase[shortURL]["longURL"];
  res.redirect(longURL);
});

// Handling get request for show Page
app.get('/urls/:id', (req, res) => {
  const user = fetchUser(users, req.session);
  const result = checkPermission(req, urlDatabase)
  // if not logged in
  if (!user) {
    return res.redirect("/login")
  }
  // if link not right/ or do not have permission
  else if (result.error) {
    res.status(403)
    return res.send(result.error)
  } else {
    let longURL = urlDatabase[result.data]["longURL"];
    const templateVars = { shortURL: result.data, longURL, user };
    return res.render("urls_show", templateVars);
  }
});

// Request for route/Urls page
app.get('/urls', (req, res) => {
  const user = fetchUser(users, req.session);
  if (user && user.id) {
    let filteredUrls = urlsForUser(user.id, urlDatabase);
    const templateVars = { urls: filteredUrls, user };
    return res.render("urls_index", templateVars)
  }
  res.render("urls_index", { user });
});

app.get('/', (req, res) => {
  res.redirect("/urls");
});

// Handling Delete Request

app.post('/urls/:id/delete', (req, res) => {
  let result = checkPermission(req, urlDatabase)
  if (result.error) {
    res.status(403)
    return res.send(result.error)
  }
  delete urlDatabase[result.data];
  return res.redirect("/urls");

});

// Handing Edit Request

app.post('/urls/:id/edit', (req, res) => {
  let result = checkPermission(req, urlDatabase)
  if (result.error) {
    res.status(403)
    return res.send(result.error)
  }
  let updatedUrl = req.body.updatedUrl;
  urlDatabase[result.data]["longURL"] = updatedUrl;
  return res.redirect("/urls");
});

//Login Route
app.get('/login', (req, res) => {
  const user = fetchUser(users, req.session);
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let user = checkUser(users, userEmail);
  console.log(user);
  if (user) {
    let passwordCheck = bcrypt.compareSync(req.body.password, user.hashedPassword);
    if (passwordCheck) {
      req.session["user_id"] = user["id"];
      return res.redirect('urls');
    }
  }
  res.statusCode = 403;
  res.send("wrong email/password, try again.");
});

//logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Register Route
app.get('/register', (req, res) => {
  const user = fetchUser(users, req.session);
  // if user already logged in, sending back to homepage
  if (user) {
    return res.redirect("/urls")
  }
  res.render("register", { user });
});

app.post('/register', (req, res) => {
  console.log(req.body);
  const result = createUser(users, req.body);
  if (result.error) {
    res.statusCode = 400;
    return res.send(result.error);
  }
  req.session["user_id"] = result.user["id"];
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

function checkPermission(req, urlDB) {
  let userId = req.session.user_id
  let urlId = req.params.id;
  if (!urlDB[urlId]) {
    return { data: null, error: "URL Not found" }
  }
  else if (urlDB[urlId]["userID"] !== userId) {
    return { data: null, error: "You do not have permission!" }
  }
  return { data: urlId, error: null };
}
