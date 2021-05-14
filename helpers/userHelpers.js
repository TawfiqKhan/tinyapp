const bcrypt = require('bcrypt');

// Creates new User, Uses checkUser function as well
function createUser(usersDb, body) {
  const id = Math.random().toString(36).substring(2, 8);
  const { email, password } = body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return { user: null, error: "Invalid Fields" };
  }
  //Checking to see if user alredy exist
  if (checkUser(usersDb, email)) {
    return { user: null, error: "User Already Exist!" };
  }
  usersDb[id] = { id, email, hashedPassword };
  return { user: usersDb[id], error: null };
}

//Checks whether user already exists in the DB or not.
function checkUser(usersDB, email) {
  for (let user in usersDB) {
    if (usersDB[user].email === email) {
      return usersDB[user];
    }
  }
  return null;
}

// Fetch user data using cookies
function fetchUser(usersDB, cookies) {
  let id = cookies.user_id;
  if (!usersDB[id]) {
    return null;
  }
  return usersDB[id];
}

function generateRandomString() {
  let output = '';
  let charSet = 'abcdefghijklmnopqrstuvwxyz123456789';
  for (let i = 0; i < 7; i++) {
    output = output.concat(charSet[Math.floor(Math.random() * (charSet.length - 1))]);
  }
  return output;
}

// Checks whether use have permission to perform CRUD
function checkPermission(req, urlDB) {
  let userId = req.session.user_id;
  let urlId = req.params.id;
  if (!urlDB[urlId]) {
    return { data: null, error: "URL Not found" };
  } else if (urlDB[urlId]["userID"] !== userId) {
    return { data: null, error: "You do not have permission to do that!" };
  }
  return { data: urlId, error: null };
}

// Filters the URL which belongs to the user.
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

module.exports = { generateRandomString, createUser, checkUser, fetchUser, urlsForUser, checkPermission };