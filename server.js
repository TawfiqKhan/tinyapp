const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const flash = require('connect-flash');
const PORT = 3000;
const bcrypt = require('bcrypt');

const { generateRandomString,createUser, checkUser, fetchUser, urlsForUser, checkPermission } = require("./helpers/userHelpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// app.use(cookieParser());

// Cookie Session Middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


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
  let userID = req.session["user_id"];
  urlDatabase[shortURL] = { longURL, userID };
  req.flash('success', "Your URL has been added!");
  res.redirect(`/urls/${shortURL}`);
});

// get request to Url's destination

app.get("/u/:id", (req, res) => {
  const user = fetchUser(users, req.session);
  let shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    res.statusCode = 404;
    res.render("404", { user, error: "URL Not Found" });
  }
  let longURL = urlDatabase[shortURL]["longURL"];
  res.redirect(longURL);
});

// Handling get request for show Page
app.get('/urls/:id', (req, res) => {
  console.log(res.locals);
  const user = fetchUser(users, req.session);
  const result = checkPermission(req, urlDatabase);
  // if not logged in
  if (!user) {
    req.flash('error', "You need to login see that url!");
    return res.redirect("/login");
  } else if (result.error) {
    // if link not right/ or do not have permission
    res.status(403);
    req.flash('error', result.error);
    return res.redirect("/urls");
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
    return res.render("urls_index", templateVars);
  }
  res.render("urls_index", { user });
});

app.get('/', (req, res) => {
  res.redirect("/urls");
});

// Handling Delete Request

app.post('/urls/:id/delete', (req, res) => {
  let result = checkPermission(req, urlDatabase);
  if (result.error) {
    res.status(403);
    return res.send(result.error);
  }
  delete urlDatabase[result.data];
  req.flash('success', "The URL has been deleted!");
  return res.redirect("/urls");

});

// Handing Edit Request

app.post('/urls/:id/edit', (req, res) => {
  let result = checkPermission(req, urlDatabase);
  if (result.error) {
    req.flash('error', result.error);
    return res.redirect("/urls");
  }
  let updatedUrl = req.body.updatedUrl;
  urlDatabase[result.data]["longURL"] = updatedUrl;
  req.flash('success', "You have successfully updated your URL!");
  return res.redirect("/urls");
});

//Login Route
app.get('/login', (req, res) => {
  const user = fetchUser(users, req.session);
  if (user) {
    req.flash('error', "You are already logged in!");
    return res.redirect("/urls");
  }
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let user = checkUser(users, userEmail);
  if (user) {
    let passwordCheck = bcrypt.compareSync(req.body.password, user.hashedPassword);
    if (passwordCheck) {
      req.session["user_id"] = user["id"];
      req.flash('success', "You have successfully logged in!");
      return res.redirect('urls');
    }
  }
  res.statusCode = 403;
  req.flash('error', "Wrong email/password, try again.");
  res.redirect('/login');
});

//logout route
app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

//Register Route
app.get('/register', (req, res) => {
  const user = fetchUser(users, req.session);
  // if user already logged in, sending back to homepage
  if (user) {
    req.flash('error', "You are already logged in!");
    return res.redirect("/urls");
  }
  res.render("register", { user });
});

app.post('/register', (req, res) => {
  const result = createUser(users, req.body);
  if (result.error) {
    res.statusCode = 400;
    req.flash('error', result.error);
    return res.redirect("/register");
  }
  req.session["user_id"] = result.user["id"];
  req.flash('success', "Registration Successful, Welcome Abroad!");
  res.redirect("/urls");
});

// Server Creation
app.listen(PORT, () => {
  console.log(`Server is Listening to http://localhost:${PORT}`);
});

//>>>>>>>>   Helper function <<<<<<<<//

