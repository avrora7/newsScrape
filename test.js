var cheerio = require("cheerio");
var request = require("request");

function getFromCheerio(callback) {

    // Making a request for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
    request("https://www.wsj.com/", function (error, response, html) {

        var $ = cheerio.load(html);
        var results = [];

        $(".wsj-card").each(function (i, element) {

            var news = {
                headline: $(element).find("h3").text(),
                link: $(element).find("a").attr("href"),
                summary: $(element).find(".wsj-summary").text()
            }

            if (news.headline && news.summary && news.link) {
                results.push(news);
            }

        });

        callback(results);
    });

}

getFromCheerio(function(res) {
    console.log(res);
})

