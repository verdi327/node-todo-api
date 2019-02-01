require("./../server/config")
let {mongoose} = require("./../server/db")
let {User} = require("./../server/models/user")

// User.findById("5c546efb727f306d8b587000").then(user => {
// 	console.log(user.toJSON())
// })

// User.findOne({
// 	"_id": "5c547f93adc028978f5131d5",
// 	"tokens.access": "auth"
// }).then(user => {
// 	console.log(user)
// })