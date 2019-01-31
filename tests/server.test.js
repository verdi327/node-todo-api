const expect = require("expect")
const request = require("supertest")
const {app} = require("./../server/server")
const {Todo} = require("./../server/models/todo")
const {ObjectID} = require("mongodb")

const sampleTodos = [
	{_id: new ObjectID(), text: "first todo"},
	{_id: new ObjectID(), text: "second todo"}
]

beforeEach(done => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(sampleTodos)
	}).then(() => done())
})

describe("POST /todos", () => {
	it ("should create a new todo", (done) => {
		let text = "a new todo"

		request(app)
			.post("/todos")
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
			.send({})
			.expect(400)
			.expect(res => {
				expect(res.body).toInclude({"message": "Todo validation failed"})
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.find().then(todos => {
					expect(todos.length).toBe(2)
					done()
				}).catch(err => done(err))
			})
	})
})

describe("GET /todos", () => {
	it("should return all the todos", (done) => {
		request(app)
			.get("/todos")
			.expect(200)
			.expect(res => {
				expect(res.body.todos.length).toBe(2)
			})
			.end(done);
	})
})

describe("GET /todos/:id", () => {
	it("should return the correct todo with valid id", (done) => {
		request(app)
			.get(`/todos/${sampleTodos[0]._id.toHexString()}`)
			.expect(200)
			.expect(res => {
				expect(res.body.todo).toInclude(sampleTodos[0])
			})
			.end(done)
	})

	it("should return 404 if invalid id is sent", (done) => {
		request(app)
			.get("/todos/1234")
			.expect(404)
			.end(done)
	})

	it("should return 404 if unable to find a todo", (done) => {
		let badId = "6c6332c4be32af8b6d836528"
		request(app)
			.get(`/todos/${badId}`)
			.expect(404)
			.end(done)
	})
})

describe("DELETE /todos/:id", () => {
	it("should delete a given todo and return it", (done) => {
		let sampleId = sampleTodos[0]._id.toHexString()
		request(app)
			.delete(`/todos/${sampleId}`)
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

	it("should return a 404 if invalid id", (done) => {
		request(app)
			.delete("/todos/123abc")
			.expect(404)
			.end(done)
	})

	it("should return 404 if unable to find todo", (done) => {
		let badId = "6c6332c4be32af8b6d836528"

		request(app)
			.delete(`/todos/${badId}`)
			.expect(404)
			.end(done)
	})
})



