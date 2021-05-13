const bcrypt = require('bcrypt');

function createUser(usersDb, body) {
  const id = Math.random().toString(36).substring(2, 8);
  const { email, password } = body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return { user: null, error: "Invalid Fields" };
  }
  //Checking to see if user alredy exist
  if (checkUser(usersDb, body)) {
    return { user: null, error: "User Already Exist!" };
  }
  usersDb[id] = { id, email, hashedPassword };
  return { user: usersDb[id], error: null };
}

function checkUser(usersDB, body) {
  let userEmail = body.email;
  for (let user in usersDB) {
    if (usersDB[user].email === userEmail) {
      return usersDB[user];
    }
  }
  return null;
}

function fetchUser(usersDB, cookies) {
  let id = cookies.user_id;
  console.log("line 31 id:", id )
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

module.exports = { generateRandomString,createUser, checkUser, fetchUser};