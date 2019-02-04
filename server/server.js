require("./config")
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const port = process.env.PORT || 3000
const _ = require("lodash")
const bcrypt = require("bcryptjs");

let {mongoose} = require("./db")
let {ObjectID} = require("mongodb")
let {User} = require("./models/user")
let {Todo} = require("./models/todo")
const {authenticate} = require('./middleware/authenticate');

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

// find a todo
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

// remove a todo
app.delete("/todos/:id", (req, res) => {
	let id = req.params.id

	if (!ObjectID.isValid(id)){
		return res.status(404).send()
	}

	Todo.findByIdAndRemove(id).then(todo => {
		if (!todo) {
			return res.status(404).send()
		}

		res.send({todo})
	}).catch(e => {
		res.status(400).send()
	})
})

// edit a todo
app.patch("/todos/:id", (req, res) => {
	let id = req.params.id
	// picks props if they exist to add to a new obj
	let body = _.pick(req.body, ["text", "completed"])
	
	if (!ObjectID.isValid(id)){
		return res.status(404).send()
	}

	if (_.isBoolean(body.completed) && body.completed){
		body.completedAt = new Date().getTime()
	} else {
		body.completed = false
		body.completedAt = null
	}

	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
		if (!todo){
			return res.status(404).send()
		}
		res.send({todo})
	}).catch(e => {
		res.status(400).send()
	})
})

// create a new user
app.post("/users", (req, res) => {
	let body = _.pick(req.body, ["email", "password"])
	let newUser = new User(body)

	newUser.save().then(user => {
		return user.generateAuthToken()
	}).then(token => {
		res.header("x-auth", token).send(newUser)
	}).catch(e => {
		res.status(400).send(e)
	})
})

// return the currently logged in user
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// log in a user
app.post("/users/login", (req, res) => {
	let body = _.pick(req.body, ["email", "password"])

	User.findByCredentials(body.email, body.password).then(user => {
		return user.generateAuthToken().then(token => {
			res.header("x-auth", token).send(user)
		})
	}).catch(e => {
		res.status(400).send();
	});
})

// log a user out
app.delete("/users/me/token", authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	})
})



app.listen(port, () => {
	console.log(`server is online at port ${port}`)
})

module.exports = {app}
