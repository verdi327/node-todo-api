const expect = require("expect")
const request = require("supertest")
const {app} = require("./../server/server")
const {Todo} = require("./../server/models/todo")
const {User} = require("./../server/models/user")
const {ObjectID} = require("mongodb")
const {sampleTodos, populateTodos, users, populateUsers} = require("./seed")

beforeEach(populateUsers)
beforeEach(populateTodos)

describe("POST /todos", () => {
	it ("should create a new todo", (done) => {
		let text = "a new todo"

		request(app)
			.post("/todos")
			.set("x-auth", users[0].tokens[0].token)
			.send({text})
			.expect(200)
			.expect(res => {
				expect(res.body.text).toBe(text)
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.find({text}).then(todos => {
					expect(todos.length).toBe(1)
					expect(todos[0].text).toBe(text)
					done()
				}).catch(e => done(e))
			})
	})

	it("should NOT create a todo with invalid params", (done) => {
		request(app)
			.post("/todos")
			.set("x-auth", users[0].tokens[0].token)
			.send({})
			.expect(400)
			.expect(res => {
				expect(res.body).toInclude({"message": "Todo validation failed"})
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.find({_creator: users[0]._id}).then(todos => {
					expect(todos.length).toBe(1)
					done()
				}).catch(err => done(err))
			})
	})
})

describe("GET /todos", () => {
	it("should return all the todos", (done) => {
		request(app)
			.get("/todos")
			.set("x-auth", users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body.todos.length).toBe(1)
			})
			.end(done);
	})
})

describe("GET /todos/:id", () => {
	it("should return the correct todo with valid id", (done) => {
		request(app)
			.get(`/todos/${sampleTodos[0]._id.toHexString()}`)
			.set("x-auth", users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body.todo).toInclude(sampleTodos[0])
			})
			.end(done)
	})

	it("should return 404 if invalid id is sent", (done) => {
		request(app)
			.get("/todos/1234")
			.set("x-auth", users[0].tokens[0].token)
			.expect(404)
			.end(done)
	})

	it("should return 404 if unable to find a todo", (done) => {
		let badId = "6c6332c4be32af8b6d836528"
		request(app)
			.get(`/todos/${badId}`)
			.set("x-auth", users[0].tokens[0].token)
			.expect(404)
			.end(done)
	})

	it("should NOT return todo created by other users", (done) => {
		request(app)
			.get(`/todos/${sampleTodos[0]._id.toHexString()}`)
			.set("x-auth", users[1].tokens[0].token)
			.expect(404)
			.end(done)
	})
})

describe("DELETE /todos/:id", () => {
	it("should delete a given todo and return it", (done) => {
		let sampleId = sampleTodos[0]._id.toHexString()
		request(app)
			.delete(`/todos/${sampleId}`)
			.set("x-auth", users[0].tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body.todo).toInclude(sampleTodos[0])
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}
				Todo.findById(sampleId).then(todo => {
					expect(todo).toNotExist()
					done()
				}).catch(err => done(err))
			})
	})

	it("should NOT delete a todo from another user", (done) => {
		let sampleId = sampleTodos[0]._id.toHexString()
		request(app)
			.delete(`/todos/${sampleId}`)
			.set("x-auth", users[1].tokens[0].token)
			.expect(404)
			.end(done)
	})

	it("should return a 404 if invalid id", (done) => {
		request(app)
			.delete("/todos/123abc")
			.set("x-auth", users[0].tokens[0].token)
			.expect(404)
			.end(done)
	})

	it("should return 404 if unable to find todo", (done) => {
		let badId = "6c6332c4be32af8b6d836528"

		request(app)
			.delete(`/todos/${badId}`)
			.set("x-auth", users[0].tokens[0].token)
			.expect(404)
			.end(done)
	})
})

describe("PATCH /todos/:id", ()=> {
	it("should update a todo", (done) => {
		let sampleId = sampleTodos[0]._id.toHexString()
		let text = "an updated todo"
		request(app)
			.patch(`/todos/${sampleId}`)
			.set("x-auth", users[0].tokens[0].token)
			.send({text})
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(text)
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}
				Todo.findOne({_id: sampleId, _creator: users[0]._id}).then(todo => {
					todo = todo.toObject();
					expect(todo.text).toBe(text)
					done()
				}).catch(e => done(e))
			})
	})

	it("should NOT update a todo from another user", (done) => {
		let sampleId = sampleTodos[0]._id.toHexString()
		let text = "an updated todo"
		request(app)
			.patch(`/todos/${sampleId}`)
			.set("x-auth", users[1].tokens[0].token)
			.send({text})
			.expect(404)
			.end(done)
	})
	
	it("should clear completeAt when todo is marked not completed", (done) => {
		let sampleId = sampleTodos[1]._id.toHexString()
		request(app)
			.patch(`/todos/${sampleId}`)
			.set("x-auth", users[1].tokens[0].token)
			.send({complete: false})
			.expect(200)
			.expect(res => {
				expect(res.body.todo).toInclude({completed: false, completedAt: null})
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}
				Todo.findOne({_id: sampleId, _creator: users[1]._id}).then(todo => {
					todo = todo.toObject();
					expect(todo).toInclude({completed: false, completedAt: null})
					done()
				}).catch(e => done(e))
			})
	})
})

describe("GET /users/me", () => {
	it("should return user if authenticated", (done) => {
		let user = users[0]
		request(app)
			.get("/users/me")
			.set("x-auth", user.tokens[0].token)
			.expect(200)
			.expect(res => {
				expect(res.body._id).toBe(user._id.toHexString())
				expect(res.body.email).toBe(user.email)
			})
			.end(done)
	})

	it("should return a 401 if NOT authenticated", (done) => {
		request(app)
			.get("/users/me")
			.expect(401)
			.end(done)
	})
})

describe("POST /users", () => {
	it("should create a user", done => {
		let user = {email: "foo@bar.com", password: "abc123"}
		request(app)
			.post("/users")
			.send(user)
			.expect(200)
			.expect(res => {
				expect(res.body.email).toBe(user.email)
				expect(res.body._id).toExist()
				expect(res.header["x-auth"]).toExist()
			})
			.end((err, res) => {
				if (err){
					return done(err)
				}
				User.findOne({email: user.email}).then(userDoc => {
					expect(userDoc).toExist()
					expect(userDoc.password).toNotBe(user.password)
					done()
				}).catch(e => done(e))
			})
	})

	it("should return validation error if request invalid", done => {
		let user = {email: "foo@bar.com", password: "abc"}
		request(app)
			.post("/users")
			.send(user)
			.expect(400)
			.expect(res => {
				expect(res.body).toInclude({"name": "ValidationError"})
			})
			.end(done)
	})

	it("should return validation error if email already exists", done => {
		request(app)
			.post("/users")
			.send(users[0])
			.expect(400)
			.expect(res => {
				expect(res.body).toInclude({code: 11000})
			})
			.end(done)
	})
})

describe("POST /users/login", () => {
	it("should return an auth token for a valid email and password", (done) => {
		request(app)
			.post("/users/login")
			.send({email: users[1].email, password: users[1].password})
			.expect(200)
			.expect(res => {
				expect(res.headers["x-auth"]).toExist()
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				User.findById(users[1]._id).then(user => {
					user = user.toObject();
					
					expect(user.tokens[1]).toInclude({
						access: "auth",
						token: res.headers["x-auth"]
					})
					done();
				}).catch(e => done(e));
			})
	})

	it("should return a 400 if invalid password", (done) => {
		request(app)
			.post("/users/login")
			.send({email: users[1].email, password: users[1].password + "xx"})
			.expect(400)
			.expect(res => {
				expect(res.headers["x-auth"]).toNotExist()
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				User.findById(users[1]._id).then(user => {
					user = user.toObject()
					expect(user.tokens.length).toBe(1)
					done()
				}).catch(e => done(e))
			})
	})
})

describe("DELETE /users/me/token", () => {
	it("should logout a user by deleting their auth token", (done) => {
		request(app)
			.delete("/users/me/token")
			.set("x-auth", users[0].tokens[0].token)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				User.findById(users[0]._id).then(user => {
					user = user.toObject();
					expect(user.tokens.length).toBe(0)
					done()
				}).catch(e => done(e))
			})
	})
})