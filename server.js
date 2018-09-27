var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");
var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

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

app.get("/articles", function (req, res) {
    console.log("here")
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/articles/:id", function (req, res) {

    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.delete("/articles/:articleId/:noteId", function (req, res) {
    db.Article.findOne({ _id: req.params.articleId })
        .populate('notes')
        .exec(function (err, dbArticle) {
            db.Note.findOne({ _id: req.params.noteId })
                .then(function (dbNote) {
                    for (var i = 0; i < dbArticle.notes.length; i++) {
                        if (dbArticle.notes[i]._id == dbNote._id) {
                            dbArticle.notes.splice(i, 1)
                            break;
                        }
                    }
                    dbArticle.save().then(function (dbArticle) {
                        db.Note.remove({ _id: dbNote._id }, function (err, data) {
                            console.log("err-" + err)
                            res.json("ok");
                        });
                    })
                });
        });
});

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            db.Article.findOne({ _id: req.params.id })
                .populate('notes')
                .exec(function (err, dbOneArticle) {
                    dbOneArticle.notes.push(dbNote)
                    dbOneArticle.save(function (dbSavedOne) {
                        res.json(dbSavedOne);
                    });
                });
        });
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

