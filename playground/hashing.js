const jwt = require("jsonwebtoken")

let data = {
	id: 222,
	text: "a new todo"
}

let encrypted = jwt.sign(data, "secret_sauce")
console.log("data: ", data)
console.log("encrypted data: ", encrypted)

console.log("MITM ATTACK!")

let data2 = {
	id: 223,
	text: "fudging a new todo"
}

let encrypted2 = jwt.sign(data2, "no-idea")

console.log("verifying data", jwt.verify(encrypted2, "secret_sauce"))


