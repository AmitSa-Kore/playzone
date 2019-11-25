var botId = "st-ff3253b8-2446-56b0-b7cc-d1437bfd08bd";
var botName = "L3Harris Bot";
var sdk = require("./lib/sdk");

/*
 * This is the most basic example of BotKit.
 *
 * It showcases how the BotKit can intercept the message being sent to the bot or the user.
 *
 * We can either update the message, or chose to call one of 'sendBotMessage' or 'sendUserMessage'
 */

function getImage(FileUrl) {
    return new Promise(function(res, rej) {
        if (res) {
            var chunks = [];
            //var out = fs.createWriteStream();
            console.log("got file link");
            var fetch = new FetchStream(FileUrl);
            fetch.on("data", function(chunk) {
                //console.log(chunk);
                chunks.push(chunk);
            });
            fetch.on('end', function() {
                res(chunks);
            });
        } else
            rej(err);
    });
}

module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : function(requestId, data, callback) {
        if (data.message === "Hi") {
            data.message = "Hello";
            //Sends back 'Hello' to user.
            return sdk.sendUserMessage(data, callback);
        } else if(!data.agent_transfer){
            //Forward the message to bot
            return sdk.sendBotMessage(data, callback);
        } else {
            data.message = "Agent Message";
            return sdk.sendUserMessage(data, callback);
        }
    },
    on_bot_message  : function(requestId, data, callback) {
        if (data.message === 'hello') {
            data.message = 'The Bot says hello!';
        }
        //Sends back the message to user
        
        return sdk.sendUserMessage(data, callback);
    },
    on_agent_transfer : function(requestId, data, callback){
        return callback(null, data);
    },
    on_event : function (requestId, data, callback) {
        console.log("on_event -->  Event : ", data.event);
        return callback(null, data);
    },
    on_alert : function (requestId, data, callback) {
        console.log("on_alert -->  : ", data, data.message);
        return sdk.sendAlertMessage(data, callback);
    },
    on_webhook: function(requestId, data, componentName, callback) {
        if (componentName === 'uploadWebhook') {
            if (data.context.entities.attachment !== undefined) {
                var FileName = data.context.entities.attachment[0].fileName;
                var FileUrl = data.context.entities.attachment[0].url.fileUrl;
                console.log("file............" + FileUrl);
                getImage(FileUrl).then(function(ImageData) {
                    request({
                        url: 'https://mi-dev.harris.com/dev/ManagerSelfServiceAPI/api/v1/ManagerSelfService/UploadFile', 
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'content-type': 'multipart/form-data; boundary=---------------------------7227216955575',
                            'authorization': "bearer token",//pull the data from customdata and set it here
                            'Content-Length': '488208',
                            'Content-Disposition': 'form-data; name="file"; filename="Apple_Developer_Enterprise_Program_License_20190603.pdf"'
                            
                        },
                        body: ImageData
                   }, function(error, response, body) {
                        if (error)
                            console.log("Error--------->", error);
                        else {
                            var r = response.body.toString();
                            console.log("body.................", r);
                        }
                        return callback(null, data)
                    });
                });
            }
        }
    }

};