Mail = {};

//得到前10封未读邮件的message
Mail.getUnseenMessages = function(limit){
  if(!limit){
    limit = 10;
  }
  var inboxPath = MailManager.getBoxBySpecialUse("\\Inbox").path;
  var conn = MailCollection.getMessageCollection(inboxPath);
  var messages = conn.find({"flags":{$ne:"\\Seen"}},{sort: {uid:-1}, skip: 0, limit: limit}).fetch();
  return  messages;
}

io = require('../client/assets/socket.io.min.js')
forge = require('../client/assets/forge.min.js')