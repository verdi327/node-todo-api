const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

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

UserSchema.methods.removeToken = function (token) {
	let user = this;
	
	return user.update({
		$pull: {
			tokens: {token}
		}
	})
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

  return User.findOne({
    '_id': decoded.id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
	let User = this;

	return User.findOne({email}).then(user => {
		if (!user){
			return Promise.reject();
		}
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
				if (res){
					resolve(user)
				} else {
					reject()
				}	
			})
		})
	})
}

// mongoose middleware that allows us to attach a method before saving a user
// like rails before_save hook, unfortunately there is no before_create
// so we must use the isModified method which checks to see if the user
// changed the password at all, which is when we'd re-hash
UserSchema.pre("save", function(next) {
	let user = this;
	if (user.isModified("password")) {
		bcrypt.genSalt(10, (err, salt) => {
	    bcrypt.hash(user.password, salt, (err, hash) => {
	    	user.password = hash;
	    	next();
	    });
		});
	} else {
		next();
	}
})

const User = mongoose.model("User", UserSchema)


module.exports = {
	User
}





