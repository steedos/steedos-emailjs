Mail = {};

//得到前5封未读邮件的部分message
Mail.getUnseenMessages = function(){
	MailUnseendisplay.getUnseenMessages(function(){
  		var conn = MailCollection.unseenCollection();
  		var messages = conn.find({},{sort: {uid:-1}, skip: 0, limit: MailUnseendisplay.uidNumber}).fetch();

		return  messages;
	});
}
