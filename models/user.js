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
				message: (props) => `${props.value} is not a valid userName!`
			},
			required: [ true, 'userName is required (min. 3 tokens, max. 20 tokens)' ],
			unique: true
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
