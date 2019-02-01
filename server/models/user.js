const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 5,
		trim: true,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: "{VALUE} is not a valid email"
		}
	},
	password: {
		type: String,
		require: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
})

// over-riding the toJSON which gets called by mongoose when returning docs
// we are doing this b/c we only want to return a subset of the values
UserSchema.methods.toJSON = function () {
	let user = this
	let userObj = user.toObject()
	return _.pick(userObj, ["_id", "email"])
}

// .methods adds instance methods to a user
UserSchema.methods.generateAuthToken = function () {
	let user = this;
	let access = "auth"
	let token = jwt.sign({id: user._id.toHexString(), access}, "abc123")
	
	user.tokens = user.tokens.concat({access, token})

	return user.save().then(user => {
		return token
	}, (e) => {return e})
}

// .statics adds class methods to User
UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    return Promise.reject();
  }

  console.log(decoded)

  return User.findOne({
    '_id': decoded.id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

const User = mongoose.model("User", UserSchema)


module.exports = {
	User
}





