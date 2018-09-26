var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");
var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/", function (req, res) {
    db.Article.find({})
        .then(function (dbArticles) {
            var uniqueArtLinks = {};
            for (var i = 0; i < dbArticles.length; i++) {
                var nextLink = dbArticles[i].link;
                uniqueArtLinks[nextLink] = 1;
            }
            getFromCheerio(function (results) {
                trueResults = [];
                for (var i = 0; i < results.length; i++) {
                    if (uniqueArtLinks[results[i].link] == null) {
                        trueResults.push(results[i]);
                    }
                }
                db.Article.insertMany(trueResults, function (err, dbMany) {
                    db.Article.find({})
                        .populate('notes')
                        .exec(function (err, dbAll) {
                            console.log("c=" + dbAll)
                            var hbsObject = {
                                articles: dbAll
                            };
                            res.render("index", hbsObject);
                        });
                });
            });
        })
});

function getFromCheerio(callback) {
    request("https://www.wsj.com/", function (error, response, html) {
        var $ = cheerio.load(html);
        var results = [];

        $(".wsj-card").each(function (i, element) {
            var news = {
                headline: $(element).find("h3").text(),
                link: $(element).find("a").attr("href"),
                summary: $(element).find(".wsj-summary span:first-child").text()
            }
            if (news.headline && news.summary && news.link) {
                results.push(news);
            }
        });
        callback(results);
    });
}

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    console.log("here")
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

// function test() {
//     db.Article.create(
//         { headline: "My 2 21212 article", summary: "my summary", link: "https://ibm.com" },
//         function (err, dbArticle) {
//             console.log(err);
//             db.Note.create({ title: "note 1", body: "body 1" }, function (err, dbNote) {
//                 console.log(dbArticle)
//                 dbArticle.notes.push(dbNote);
//                 dbArticle.save(function (err, dbArticle2) {
//                     console.log(dbArticle2);
//                 });
//             });
//         });
// }

// test();
