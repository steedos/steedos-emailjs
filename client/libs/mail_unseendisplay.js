MailUnseendisplay = {};

MailUnseendisplay.uidNumber = 5;

//下载前5封未读邮件
MailUnseendisplay.getUnseenMessages = function(callback){
	var client = ImapClientManager.getClient();
	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		var inboxPath = "Inbox";

		client.search(inboxPath, {unseen:true}, {byUid: true}).then(function(result){
			var len = result.length;
			var unseenUids;
			if(!result || len == 0){
				return;
			}else if(len > MailUnseendisplay.uidNumber){
				unseenUids = result.slice(len - MailUnseendisplay.uidNumber, len);
			}else{
				unseenUids = result;
			}

			console.log("[MailUnseendisplay.getUnseenMessages] unseenUids is " + unseenUids);

			var query = ['uid', 'envelope'];

			client.listMessages(inboxPath, unseenUids, query, {byUid: true}).then(function(messages){
				//清空MailCollection.unseenCollection()
				MailCollection.unseenCollection().remove({});

				messages.forEach(function(message){
					if(message && message.uid){
						var hMessage = handerUnseenMessage(message);
						MailCollection.unseenCollection().insert(hMessage);
					}
				});

				console.log("MailUnseendisplay.listMessages + messages length is " + messages.length);

				client.close();

				if(typeof(callback) == "function"){
					callback();
				}
			});
		})
	})
}


function handerUnseenMessage(message){

	var rev = {};

	var envelope = message["envelope"];
	rev.uid = message.uid;
	rev.flags = message.flags;
	rev.date =envelope.date;
	rev.subject = envelope.subject;
	rev.from = envelope.from;
	rev.sender = envelope.sender;
	rev.reply_to = envelope["reply-to"];
	rev.to = envelope.to;
	rev.cc = envelope.cc;
	rev.bcc = envelope.bcc;
	rev.in_reply_to = envelope["in-reply-to"];

	return rev;
}
