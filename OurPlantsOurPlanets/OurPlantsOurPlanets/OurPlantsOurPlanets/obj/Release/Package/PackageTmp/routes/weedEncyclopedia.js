'use strict';
var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 50760,
    user: 'azure',
    password: '6#vWHD_$',
    database: 'opopdb'
});
connection.connect();

/* GET identifier page. */
router.get('/', function (req, res) {
    if (!req.session.allowedAccess) {
        res.redirect('/authenticate');
    }
    //res.render('index', { title: path.join(__dirname +'/views/weedIdentifier.cshtml')  });
    var htmlString = "";
    fs.readFile(path.join('D:/home/site/wwwroot' + '/views/header1.html'), function (err, data) {
        htmlString = htmlString + data.toString();
        fs.readFile(path.join('D:/home/site/wwwroot' + '/views/weedEncyclopedia.html'), function (err, data) {
            htmlString = htmlString + data.toString().substr(1);
            htmlString = htmlString + '<section class="ftco-section"> <div class=" cal row pt-3" style="margin-left:40px; margin-right:40px">';
            var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
            alphabet.forEach(printAlpha);
            function printAlpha(item, index) {
                if (item == "A") {
                    htmlString = htmlString + '<div class="alphabet d-flex justify-content-center align-items-center active"> ';
                }
                else {
                    htmlString = htmlString + '<div class="alphabet d-flex justify-content-center align-items-center"> ';
                }
                if (item == "J" || item == "L" || item == "O" || item == "Q" || item == "U" || item == "X" || item == "Z" || item == "V" || item == "Y") {
                    htmlString = htmlString + '<a class="alphabet-name" id="' + item.toLowerCase() + 'button" style="color:LightGray">';
                } else {
                    htmlString = htmlString + '<a class="alphabet-name" href="/weedEncyclopedia/#' + item.toLowerCase() + '" id="' + item.toLowerCase() + 'button" >';
                }
                htmlString = htmlString + item + '</a></div>';

            }
            htmlString = htmlString + '</div> </section >';
            alphabet.forEach(printCard);
            /* <div class="row d-flex">
          <div class="col-md-4 d-flex ftco-animate">
          	<div class="blog-entry justify-content-end">
              <a href="blog-single.html" class="block-20" style="background-image: url('/images/image_1.jpg');">
              </a>
              <div class="text p-4 float-right d-block">
              	
              	<h3 class="heading mb-0"><a href="#">All you want to know about industrial laws</a></h3>
                <p>A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>
                <p><a href="#" class="btn btn-primary">Read more</a></p>
              </div>
            </div>
          </div>*/
            function printCard(item, index) {
                var queryString = 'SELECT common_name, basic_description,img_link from weed where common_name like \'' + item.toLowerCase() + '%\'';
                connection.query(queryString, function (error, results, fields) {
                        htmlString = htmlString + '<div style="display:none" class="alphabet-content" id="' + item.toLowerCase() + '">';
                    htmlString = htmlString + '<section class="ftco-section bg-light"><div class="container"><div class="row d-flex">';

                    if (error) var name = 'problem';
                    for (var i = 0; i < results.length; i++) {
                        var replacement = results[i].basic_description;
                        if (results[i].basic_description.length < 105) {
                            var remaining = 95 - results[i].basic_description.length;
                            var filler = ' <span style="color:white;white-space:pre-line">';
                            for (var k = 0; k < remaining / 2; k++) {
                                filler = filler + "_ ";
                            }
                            replacement = replacement + filler + '</span>';
                        }
                        if (results[i].basic_description.toString().length > 87) {
                            replacement = results[i].basic_description.substring(0, 87) + '...';
                        }
                        var idUrl = results[i].common_name;
                        var image = results[i].img_link;
                        if (!results[i].img_link.endsWith(".jpg")) {
                            image = "/images/no-image.jpg";
                        }
                        htmlString = htmlString + '<div class="col-md-4 d-flex"><div class="blog-entry justify-content-end"><a href="/weedDescription?id=' + idUrl + '" class="block-20" style="background-image: url(\'' + image + '\');"></a ><div class="text p-4 float-right d-block"><h3 class="heading mb-0"><a href="/weedDescription?id=' + idUrl + '">' + results[i].common_name + '</a></h3><p>' + replacement + '</p><p><a href="/weedDescription?id=' + idUrl +'" class="btn btn-primary" style="font-size:12px">Read more</a></p></div></div></div>';
                    }
                    htmlString = htmlString + '</div></div></section>';
                    htmlString = htmlString + '</div>';
                    
                });
            }
            htmlString = htmlString + '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script> <script src = "/javascripts/weed-Encyclopedia.js" ></script >';
            fs.readFile(path.join('D:/home/site/wwwroot' + '/views/footer.html'), function (err, data) {
                htmlString = htmlString + data.toString();
                htmlString = htmlString.replace("65279", "");
                res.send(htmlString);
            });
        });
    });
});

module.exports = router;
