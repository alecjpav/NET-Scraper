var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new mongoose.Schema({
    headline: {
        type: String,
        trim: true,
        required: false,
        unique: true
    },
    summary: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        trim: true,
        required: false,
        unique: true
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;