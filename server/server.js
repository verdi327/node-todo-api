const express = require("express")
const bodyParser = require("body-parser")
const app = express()

let {mongoose} = require("./db")
let {ObjectID} = require("mongodb")
let {User} = require("./models/user")
let {Todo} = require("./models/todo")

app.use(bodyParser.json())

// list all todos
app.get("/todos", (req, res) => {
	Todo.find().then(todos => {
		res.send({todos})
	}, e => {
		res.status(400).send(e)
	})
})

// create todo
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

// find a specific todo
app.get("/todos/:id", (req, res) => {
	let id = req.params.id

	if (!ObjectID.isValid(id)){
		return res.status(404).send()
	}

	Todo.findById(id).then(todo => {
		if (!todo) {
			return res.status(404).send()
		}
		res.send({todo})
	}).catch(e => {
		res.status(400).send()
	})

})


app.listen(3000, () => {
	console.log("server is online")
})

module.exports = {app}
