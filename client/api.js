Mail = {};

//得到前5封未读邮件的部分message
Mail.getUnseenMessages = function(callback){
	MailUnseendisplay.getUnseenMessages(function(){
		var conn = MailCollection.unseenCollection();
		var messages = conn.find({},{sort: {uid:-1}, skip: 0, limit: MailUnseendisplay.uidNumber}).fetch();

		if(typeof(callback) == 'function'){
			callback(messages);
		}
	});
}

io = require('../client/assets/socket.io.min.js')
forge = require('../client/assets/forge.min.js')