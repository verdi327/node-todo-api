const express = require("express")
const bodyParser = require("body-parser")
const app = express()

let {mongoose} = require("./db")
let {User} = require("./models/user")
let {Todo} = require("./models/todo")

app.use(bodyParser.json())

app.post("/todos", (req, res) => {
	let todo = new Todo({
		text: req.body.text
	})

	todo.save().then(doc => {
		res.send(doc)
	}, e => {
		res.status(400).send(e)
	})
})


app.listen(3000, () => {
	console.log("server is online")
})

module.exports = {app}

