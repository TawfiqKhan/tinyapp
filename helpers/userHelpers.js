
function createUser(usersDb, body) {
  const id = Math.random().toString(36).substring(2, 8);
  const { email, password } = body;

  if (!email || !password) {
    return { user: null, error: "Invalid Fields" };
  }
  //Checking to see if user alredy exist
  if (checkUser(usersDb, body)) {
    return { user: null, error: "User Already Exist!" };
  }
  usersDb[id] = { id, email, password };
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
  let id = cookies["user_id"];
  if (!usersDB[id]) {
    return null;
  }
  return usersDB[id];
}

module.exports = {createUser, checkUser, fetchUser};