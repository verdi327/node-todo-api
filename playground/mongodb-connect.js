const {MongoClient, ObjectID} = require("mongodb");


MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, db) => {
	if (err) {
		return console.log("Unable to connect to Mongo server")
	}
	console.log("Connected to mongo server")

	// db.collection("Todos").insertOne({
	// 	text: "learn the MERN stack!",
	// 	completed: false
	// }, (err, result) => {
	// 	if (err) {
	// 		return console.log("unable to insert Todo", err)
	// 	}

	// 	console.log(JSON.stringify(result.ops, undefined, 2))
	// })

	// cannot search by string ID, must convert the string to an Object ID
	// new ObjectID("long as string")

	// db.collection("Todos").find({completed: false}).toArray().then(docs => {
	// 	console.log("Todos")
	// 	console.log(JSON.stringify(docs, undefined, 2))
	// }, err => {
	// 	console.log("[ERROR]: ", err)
	// })

	db.collection("Users").find({name: "Michael Verdi"}).toArray().then(docs => {
		console.log(docs)
	}, err => {
		console.log("some error", err)
	})



	db.close();
});