var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: "Password is Required",
        validate: [
            function(input) {
                return input.length >= 6;
            },
            "Password should be longer."
        ]
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

var User = mongoose.model('User', UserSchema);

module.exports = User;