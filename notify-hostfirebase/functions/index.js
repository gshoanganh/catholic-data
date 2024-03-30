/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
const functions = require('firebase-functions')
var { google } = require('googleapis');
var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

//var http = require('http')
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var router = express.Router();

var request = require('request');

//var port = 8085;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//get
router.get('/sendExpress', function (req, res) {
    try {
        getAccessToken().then(function (access_token) {

            const title = req.query.title;
            const body = req.query.body;
            const code = req.query.code;
            if (!code || code == undefined || code != "gshoanganh") {
                var result = JSON.stringify({
                    "warning": "Not allow",
                    "body": req.query
                })
                res.end(result);
                return null;
            } else {
                var options = ""
                if (token && token != undefined) {
                    options = {
                        "token": token,
                        "notification": {
                            "title": title,
                            "body": body
                        }
                    };
                } else {
                    options = {
                        "topic": "CatholicTopic",
                        "notification": {
                            "title": title,
                            "body": body
                        }
                    };
                }
                request.post({
                    headers: {
                        Authorization: 'Bearer ' + access_token
                    },
                    url: "https://fcm.googleapis.com/v1/projects/katholic-d5514/messages:send",
                    body: JSON.stringify(
                        {
                            "message": {
                                ...options,
                                "android": {
                                    "notification": {
                                        "sound": "default"
                                    }
                                },
                                "apns": {
                                    "payload": {
                                        "aps": {
                                            "sound": "default"
                                        }
                                    }
                                }
                            }
                        }
                    )
                }, function (error, response, body) {
                    try {
                        var result = JSON.stringify({
                            "result": body,
                            "body": req.query
                        })
                        res.end(result);
                        console.log('result: ', typeof (body), result);
                    } catch (e) {
                        res.end(body)
                        console.log('error: ', e);
                    }
                });
            }

        });
    } catch (error) {
        // Xử lý các ngoại lệ ở đây
        console.error(error);
        var result = JSON.stringify({
            "error": error,
            "body": req.query
        })
        res.status(500).send('Internal Server Error, ' + result);
    }
})

router.post('/send', function (req, res) {

    getAccessToken().then(function (access_token) {

        const code = req.body.code;
        if (!code || code == undefined || code != "gshoanganh") {
            var result = JSON.stringify({
                "warning": "Not allow",
                "body": req.body
            })
            res.end(result);
            return null;
        } else {
            var title = req.body.title;
            var body = req.body.body;
            var token = req.body?.token;
            //var topic = req.body?.topic;
            var badge = req.body.badge;
            var other = req.body.other;
            //console.log('test: ', req.body, other, badge)
            var options = ""
            if (token && token != undefined) {
                options = {
                    "token": token,
                    "notification": {
                        "title": title,
                        "body": body
                    }
                };
            } else {
                options = {
                    "topic": "CatholicTopic",
                    "notification": {
                        "title": title,
                        "body": body
                    }
                };
            }
            request.post({
                headers: {
                    Authorization: 'Bearer ' + access_token
                },
                url: "https://fcm.googleapis.com/v1/projects/katholic-d5514/messages:send",
                body: JSON.stringify(
                    {
                        "message": {
                            ...options,
                            "data": {
                                "badge": (!!badge && badge != undefined) ? badge : "",
                                "other": (!!other && other != undefined) ? other : ""
                            },
                            "android": {
                                "notification": {
                                    "sound": "default"
                                }
                            },
                            "apns": {
                                "payload": {
                                    "aps": {
                                        "sound": "default"
                                    }
                                }
                            }
                        }
                    }
                )
            }, function (error, response, body) {
                try {
                    var result = JSON.stringify({
                        "result": body,
                        "body": req.body
                    })
                    res.end(result);
                    console.log('result: ', typeof (body), result);
                } catch (e) {
                    res.end(body)
                    console.log('error: ', e);
                }
            });
        }
        //end        
    });
});

app.use('/api', router);

function getAccessToken() {
    return new Promise(function (resolve, reject) {
        var key = require("./service-account.json");
        var jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}

exports.api = functions.https.onRequest(app);

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });