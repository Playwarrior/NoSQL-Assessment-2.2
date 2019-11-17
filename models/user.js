const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		userName: {
			type: String,
			validate: {
				validator: function(v) {
					return /^[a-zA-Z0-9_-]{3,20}$/.test(v);
				},
				msg: `UserName is not valid! (Can only contain lower- and uppercase letters and numbers. Min characters: 3, max characters: 20).`
			},
			required: [ true, 'userName is required (min. 3 tokens, max. 20 tokens)' ],
			unique: [ true, 'Sorry, username is already in use!' ]
		},
		password: {
			type: String,
			required: [
				true,
				'Password is required (Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long)'
			]
		},
		registerDate: {
			type: Date,
			default: Date.now()
		}
	},
	{ collection: 'users' }
);

const User = mongoose.model('user', UserSchema);

module.exports = User;
