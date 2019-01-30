const {MongoClient, ObjectID} = require("mongodb");


MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, db) => {
	if (err) {
		return console.log("Unable to connect to Mongo server")
	}
	console.log("Connected to mongo server")

	//deleteMany
	// db.collection("Todos").deleteMany({text: "make love"}).then(result => {
	// 	console.log(result);
	// })
	
	// deleteOne
	// db.collection("Todos").deleteOne({text: "check email"}).then(result => {
	// 	console.log(result);
	// })

	// findOneAndDelete
	db.collection("Todos").findOneAndDelete({completed: false}).then(result => {
		console.log(result)
	})

	db.close();	
});