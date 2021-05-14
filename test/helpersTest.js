const { assert } = require("chai");
const { checkUser, createUser } = require("../helpers/userHelpers");


const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "test@gmail.com",
    hashedPassword: "abc"
  },
  aJ4256: {
    id: "aJ4256",
    email: "test2@yahoo.com",
    hashedPassword: "abc"
  },
};

const sampleBody1 = {
  email: '',
  password: '123'
}
const sampleBody2 = {
  email: 'test2@yahoo.com',
  password: '123'
}

describe("#checkUser Function Test", () => {
  it("Returns a user object when a matched user is found", () => {
    const result = checkUser(users, "test@gmail.com");
    const expectedOutput = users["aJ48lW"];
    assert.deepEqual(result, expectedOutput);
  });

  it("Returns Null when no matched user is found", () => {
    const result = checkUser(users, "new@gmail.com");
    const expectedOutput = null;
    assert.deepEqual(result, expectedOutput);
  });

})

describe("#createUser function Test", () => {
  // it("if user do not exist, returns a newly created user Object", ()=> {
  //   const result = createUser(users, sampleBody);
  //   const expectedOutput = users[result];
  // })
  it("returns error: 'Invalid Fields' if email or password not provided in body", () => {
    const result = createUser(users, sampleBody1);
    const expectedOutput = "Invalid Fields";
    assert.strictEqual(result.error, expectedOutput)
  });

  it("returns error: 'User Already Exist!' if uses exists in DB", () => {
    const result = createUser(users, sampleBody2);
    const expectedOutput = "User Already Exist!";
    assert.strictEqual(result.error, expectedOutput)
  });
})