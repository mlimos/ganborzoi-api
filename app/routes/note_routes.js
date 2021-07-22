const request = require('request');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const fs = require('fs');
const Jimp = require('jimp');


module.exports = function(app, db) {
    app.get('/api/v1/ganborzoi/inspiration', (req, res) => {

        //Initialize params
        const oauth = OAuth({
            consumer: {
              key: 'key',
              secret: 'secret'
            },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
              return crypto.createHmac('sha1', key).update(base_string).digest('base64');
            }
        });

        //Request data
        const request_data = {
            url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=ganbor_zoi&count=200&exclude_replies=true',
            method: 'GET'
        };

        //Token data
        const token = {
            key: 'key',
            secret: 'secret'
        };
        console.log('gets here');
        
        //Make request with oauth headers
        request({
            url: request_data.url,
            method: request_data.method,
            headers: oauth.toHeader(oauth.authorize(request_data, token))
        }, function(error, response, body) {

            body = JSON.parse(body);
            let filteredBody = body.filter(function (el) {
                return el.extended_entities !== undefined;
            });
            const newLength = filteredBody.length;
            console.log('length: ' + newLength);
            //Get a random number
            let randomNum = Math.floor(Math.random() * newLength); 
            //Testing to get image
            console.log('randomNum: ' + randomNum);
            console.log('tweet id: ' + filteredBody[randomNum].id_str);
            Jimp.read(filteredBody[randomNum].extended_entities.media[0].media_url, function (err, image) {
                Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then(function (font) {
                    image
                        .print(
                            font, 
                            10, 
                            10, 
                            'Do Your Best!'
                        )
                        .getBuffer(Jimp.AUTO, (err, buffer) => {
                            res.contentType('jpeg');
                            res.send(buffer);
                        })
                        //.write('test.jpg');
                })
            });
        });
    });
};
