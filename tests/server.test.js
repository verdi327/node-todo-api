const expect = require("expect")
const request = require("supertest")
const {app} = require("./../server/server")
const {Todo} = require("./../server/models/todo")

const sampleTodos = [
	{text: "first todo"},
	{text: "second todo"}
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



