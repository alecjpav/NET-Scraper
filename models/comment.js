var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new mongoose.Schema({
    textContent: {
        type: String,
        trim: true,
        required: true
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: "Article",
        required: true
    },
    user: {
        type: String,
        trim: true,
        required: true
    }
});

var Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;