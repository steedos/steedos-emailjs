Mail = {};

//得到前5封未读邮件的部分message
// Mail.getUnseenMessages = function(callback){
// 	MailUnseendisplay.getUnseenMessages(function(){
// 		var conn = MailCollection.unseenCollection();
// 		var messages = conn.find({},{sort: {uid:-1}, skip: 0, limit: MailUnseendisplay.uidNumber}).fetch();
//
// 		if(typeof(callback) == 'function'){
// 			callback(messages);
// 		}
// 	});
// }

Mail.getUnseenMessages = function(limit){
  if(!limit){
    limit = 5;
  }
  var inboxPath = MailManager.getBoxBySpecialUse("\\Inbox").path;
  var conn = MailCollection.getMessageCollection(inboxPath);
  var messages = conn.find({"flags":{$ne:"\\Seen"}},{sort: {uid:-1}, skip: 0, limit: limit}).fetch();
  return  messages;
}

io = require('../client/assets/socket.io.min.js')
forge = require('../client/assets/forge.min.js')