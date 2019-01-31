const {MongoClient, ObjectID} = require("mongodb")
const databaseUrl = "mongodb://localhost:27017/TodoApp"

MongoClient.connect(databaseUrl, (err, db) => {
	if (err) {
		return console.log("Unable to connect to MongoDB")
	}

	// db calls here

	db.close();
})


	// db.collection("Todos").findOneAndUpdate(
	// 	{ _id: new ObjectID("5c5214c1b9f45bb9fe9eec5d")},
	// 	{ $set: {completed: false}},
	// 	{ returnOriginal: false}
	// ).then(result => {
	// 	console.log(result)
	// })

	// db.collection("Users").findOneAndUpdate(
	// 	{ _id: new ObjectID("5c52184eb9f45bb9fe9eeccb")},
	// 	{ $inc: {age: 1}},
	// 	{ returnOriginal: false} 
	// ).then(result => {
	// 	console.log(result)
	// })