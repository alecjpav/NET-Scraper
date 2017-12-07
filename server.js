// Dependencies
var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
var colors = require('colors');
mongoose.Promise = require('bluebird');

// Initialize Express
var app = express();

// Creates a public static directory
app.use(express.static("public"));

// Database configuration with mongoose
var mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/MyMongo", {
        useMongoClient: true
    }
);
app.use(bodyParser.urlencoded({
    extended: false
}));

// Models
var Article = require("./models/article.js");
var User = require("./models/user.js");
var Comment = require("./models/comment.js");

// Routes
app.get("/scrape", function(req, res) {
    request("https://www.nytimes.com/", function(error, response, html) {
        var $ = cheerio.load(html);
        var entriesList = [];
        var i = 0;
        var p = Promise.resolve();
        $("article.story").each(function(i, element) {
            p = p.then(function() {
                var result = {};
                result.headline = $(element).find("h1.story-heading").text().trim() ||
                    $(element).find("h2.story-heading").text().trim() ||
                    $(element).find("h3.story-heading").text().trim();
                result.summary = $(element).children("p.summary").text().trim() || ""
                result.url = $(element).find("a").attr("href") || $(element).children("a.story-link");
                var entry = new Article(result);
                return new Promise(function(resolve, reject) {
                    entry.save(function(err, doc) {
                        if (err) {
                            if (err.code === 11000) {
                                Article.findOne({
                                        "headline": result.headline
                                    })
                                    .populate("comments")
                                    .exec(function(err, doc) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            if (doc != null) {
                                                entriesList.push(doc);
                                            }
                                        }
                                        resolve();
                                    })
                            } else {
                                console.log("ERROR SAVING ARTICLE: " + err)
                                resolve();
                            }
                        } else {
                            if (entry != null) {
                                entriesList.push(entry);
                            }
                            resolve();
                        }
                    });
                });
            });
        });
        p.then(function() {
            res.send(entriesList);
        }).catch(function(err) {
            console.log(err);
        })
    });

});

app.post("/write", function(req, res) {
    console.log(req.body)
    var comment = new Comment(req.body);
    comment.save(function(err, commentDoc) {
        if (err) {
            console.log(err)
            if (err.code === 11000) {
                res.send("Sorry, we couldn't submit your comment! Please make sure you've filled out both of the boxes before clicking the submit button.")
            }
            res.send("Sorry, something went wrong with submitting your comment! Please fill out the required fields and try again.")
        } else {
            Article.findByIdAndUpdate({
                    "_id": req.body.article
                }, {
                    "$push": {
                        "comments": commentDoc._id
                    }
                }, {
                    "new": true
                },
                function(err, articleDoc) {
                    if (err) {
                        console.log(err);
                        res.send("Sorry, we can't seem to find that article! Please refresh and try commenting again.")
                    } else {
                        res.send(articleDoc);
                    }
                }
            )
        }
    })
});

app.get("/comments", function(req, res) {
    res.sendFile(path.join(__dirname, "./public/comments.html"));
});

app.get("/api/comments", function(req, res) {
    Comment.find({})
        .populate("article")
        .exec(function(err, doc) {
            res.send(doc);
        });
});

// Set the app to listen on port 3000
app.listen(process.env.PORT || 3000, function() {
    console.log("App is running. Listening on Port 3000.".green);
});