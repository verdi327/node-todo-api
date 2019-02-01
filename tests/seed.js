const {ObjectID} = require("mongodb");
const {Todo} = require("./../server/models/todo");
const {User} = require("./../server/models/user");
const jwt = require("jsonwebtoken");


const sampleTodos = [
	{_id: new ObjectID(), text: "first todo"},
	{_id: new ObjectID(), text: "second todo", completed: true, completedAt: 555}
]

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const users = [
{
	_id: userOneId,
	email: "john@gmail.com",
	password: "abc123",
	tokens: [{access: "auth", token: jwt.sign({id: userOneId.toHexString(), access: "auth"}, "abc123")}]
},
{
	_id: userTwoId,
	email: "brad@gmail.com",
	password: "abc123" 
}]

var populateTodos = done => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(sampleTodos)
	}).then(() => done())
}

var populateUsers = done => {
	User.remove({}).then(() => {
		let user1 = new User(users[0]).save()
		let user2 = new User(users[1]).save()

		return Promise.all([user1, user2]);
	}).then(() => done())
}

module.exports = {
	populateTodos,
	sampleTodos,
	users,
	populateUsers
}