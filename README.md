# The Wall Street Journal Article Scrape

## About
* The WSJ Article Scrape is a web app that lets users view and leave comments on the latest news from https://www.wsj.com/

## Why The WSJ Article Scrape
*  Whenever a user visits the site, the app scrapes stories from ```https://www.wsj.com/``` and displays them for the user. Each scraped article is saved to the application database. The app displays the following information for each article:

* Headline 
* Summary 
* URL 

* Users also are able to leave comments on the articles displayed and revisit them later, as well as delete comments left on articles. All stored comments are visible to every user.

## How to use 
*  Launch the app by entering the following url ```https://gentle-brushlands-29461.herokuapp.com/```

### User Instructions
* Every time a user reloads the page, it displays the newest articles on top
* A user can see the headline and the summary of the article
* To view the actual article, click on the headline 
* To leave a comment on an article 
    * Go to ```Comments:``` section at the bottom of each article
    * Type in a comment title in the ```Title``` field
    * Type in the actual comment in the ```Comment``` field   
    * Click on ```Add``` button to add a comment.
* To delete a comment, click on the ```X``` in the upper right hand corner of an article.

### Built with
* HTML, CSS
* Bootstrap
* JavaScript
* Node.js
* Express
* MongoDB
* Mongoose
* Cheerio
* Handlebars

### Author
* Elizabeth Engler

### License
* This project is licensed under the MIT License
