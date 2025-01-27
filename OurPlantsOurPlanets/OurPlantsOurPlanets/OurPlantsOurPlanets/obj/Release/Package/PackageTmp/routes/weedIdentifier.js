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
var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* GET identifier page. */
router.get('/', function (req, res) {
    if (!req.session.allowedAccess) {
        res.redirect('/authenticate');
    }
    //res.render('index', { title: path.join(__dirname +'/views/weedIdentifier.cshtml')  });
    res.sendFile(path.join('D:/home/site/wwwroot' + '/views/weedIdentifier.html'));
});

router.post('/search', urlencodedParser, function (req, res) {
    var htmlString = "";
    fs.readFile(path.join('D:/home/site/wwwroot' + '/views/header1.html'), function (err, data) {
        htmlString = htmlString + data.toString();
        fs.readFile(path.join('D:/home/site/wwwroot' + '/views/searchForm.html'), function (err, data) {
            req.body.subject = req.body.subject.replace(/&/g, '&amp;').replace(/</g, '&lt;'). replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            var queryString = 'SELECT common_name,img_link, basic_description from weed where common_name like \'%' + req.body.subject + '%\'';
            htmlString = htmlString + data.toString().substr(1);
            if (req.body.email != "Any" && req.body.appearance != "Any") {
                if (req.body.postcode != "") {
                    queryString = 'SELECT weed.common_name,img_link, basic_description from weed join flowers on weed.common_name = flowers.common_name join appearance on weed.common_name = appearance.common_name join weed_control_region on weed.common_name = weed_control_region.common_name where weed.common_name like \'%' + req.body.subject.toLowerCase() + '%\'';
                    queryString = queryString + ' AND color like \'%' + req.body.email.toLowerCase() + '%\'';
                    queryString = queryString + ' AND appearance_category like \'%' + req.body.appearance + '%\'';
                    queryString = queryString + ' AND postcode =' + req.body.postcode;
                } else {
                    queryString = 'SELECT weed.common_name,img_link, basic_description from weed join flowers on weed.common_name = flowers.common_name join appearance on weed.common_name = appearance.common_name where weed.common_name like \'%' + req.body.subject.toLowerCase() + '%\'';
                    queryString = queryString + ' AND color like \'%' + req.body.email.toLowerCase() + '%\'';
                    queryString = queryString + ' AND appearance_category like \'%' + req.body.appearance + '%\'';
                }
            }
            else {
                if (req.body.email != "Any") {
                    if (req.body.postcode != "") {
                        queryString = 'SELECT weed.common_name,img_link, basic_description from weed join flowers on weed.common_name = flowers.common_name join weed_control_region on weed.common_name = weed_control_region.common_name where weed.common_name like \'%' + req.body.subject.toLowerCase() + '%\'';
                        queryString = queryString + ' AND color like \'%' + req.body.email.toLowerCase() + '%\'';
                        queryString = queryString + ' AND postcode =' + req.body.postcode;
                    } else {
                        queryString = 'SELECT weed.common_name,img_link, basic_description from weed join flowers on weed.common_name = flowers.common_name where weed.common_name like \'%' + req.body.subject.toLowerCase() + '%\'';
                        queryString = queryString + ' AND color like \'%' + req.body.email.toLowerCase() + '%\'';
                    }
                }
                if (req.body.appearance != "Any") {
                    if (req.body.postcode != "") {
                        queryString = 'SELECT weed.common_name,img_link, basic_description from weed join appearance on weed.common_name = appearance.common_name where weed.common_name like \'%' + req.body.subject.toLowerCase() + '%\'';
                        queryString = queryString + ' AND appearance_category like \'%' + req.body.appearance + '%\'';
                        queryString = queryString + ' AND postcode =' + req.body.postcode;
                    }
                    queryString = 'SELECT weed.common_name,img_link, basic_description from weed join appearance on weed.common_name = appearance.common_name where weed.common_name like \'%' + req.body.subject.toLowerCase() + '%\'';
                    queryString = queryString + ' AND appearance_category like \'%' + req.body.appearance + '%\'';
                }
                if (req.body.postcode != "") {
                    queryString = 'SELECT weed.common_name,img_link, basic_description from weed join weed_control_region on weed.common_name = weed_control_region.common_name where weed.common_name like \'%' + req.body.subject.toLowerCase() + '%\'';
                    queryString = queryString + ' AND postcode =' + req.body.postcode;
                }
            }
            connection.query(queryString, function (error, results, fields) {
                if (error) var name = 'problem';
                htmlString = htmlString + '<div class="bg-light" style="width:100%;text-align:center"><div>';
                if (results.length == 0) {
                    htmlString = htmlString + "<b><i>No results were found for the given criteria</i></b>";
                } else {
                    htmlString = htmlString + "<b><i>" + results.length + " results found</i></b>"
                }
                htmlString = htmlString + '</div></div>'
                htmlString = htmlString + '<section class="ftco-section bg-light"><div class="container"><div class="row d-flex justify-content-center">';
                var divNumber = 0;
                if (error) var name = 'problem';
                for (var i = 0; i < results.length; i++) {
                    if (Math.ceil((i + 1) / 12) > divNumber) {
                        divNumber = divNumber + 1;
                        htmlString = htmlString + '<div style="display:none" class="number-content row col-md-12 col-sm-12" id="' + Math.ceil((i + 1) / 12) + '">';
                    }
                    var replacement = results[i].basic_description;
                    if (results[i].basic_description.length < 105) {
                        var remaining = 95 - results[i].basic_description.length;
                        var filler = ' <span style="color:white;white-space:pre-line">';
                        for (var k = 0; k < remaining/2; k++) {
                            filler = filler + "_ ";
                        }
                        replacement = replacement + filler + '</span>';
                    }
                    if (results[i].basic_description.toString().length > 87) {
                        replacement = results[i].basic_description.substring(0, 87) + '...';
                    }
                    var idUrl = results[i].common_name;
                    var image = results[i].img_link;
                    if (!results[i].img_link || results[i].img_link=="" ) {
                        image = "/images/no-image.jpg";
                    }
                    htmlString = htmlString + '<div class="col-md-4 d-flex"><div class="blog-entry justify-content-end"><a href="/weedDescription?id=' + idUrl + '" class="block-20" style="background-image: url(\'' + image + '\');"></a ><div class="text p-4 float-right d-block"><h3 class="heading mb-0"><a href="/weedDescription?id=' + idUrl + '">' + results[i].common_name + '</a></h3><p>' + replacement + '</p><p><a href="/weedDescription?id=' + idUrl +'" class="btn btn-primary" style="font-size:12px">Read more</a></p></div></div></div>';
                    if ((((i + 1)%12) == 0) || ((i + 1) == results.length)) {
                        htmlString = htmlString + '</div>';
                    }
                }
                htmlString = htmlString + '</div></div></section>';
                if (results.length > 12) {
                    htmlString = htmlString + '<section class="ftco-section bg-light"><div class="container row col-md-12 bg-light" id="collapseThree"><div class="col text-center"><div class="block-27"><ul>';
                    for (var j = 0; j < Math.ceil(results.length / 12); j++) {
                        if (j == 0) {
                            htmlString = htmlString + '<li class="number justify-content-center align-items-center active" style="margin:10px"> ';
                        } else {
                            htmlString = htmlString + '<li class="number justify-content-center align-items-center" style="margin:10px"> ';
                        }
                        htmlString = htmlString + '<button style="background-color:Transparent;border:none;outline:none" class="number-name" value="' + (j + 1) + '" id="' + (j + 1) + 'button" onClick="paginateWeed(this.value)" >' + (j + 1);
                        htmlString = htmlString + '</button></li>';
                    }
                    htmlString = htmlString + '</ul></div></div></div></section>';
                }
                htmlString = htmlString + '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script> <script src = "/javascripts/weedPaginate.js" ></script >';
                fs.readFile(path.join('D:/home/site/wwwroot' + '/views/footer.html'), function (err, data) {
                    htmlString = htmlString + data.toString();
                    res.send(htmlString);
                });
            });
            
        });
    });
});

module.exports = router;
