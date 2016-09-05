MailManager = {};

MailManager.initMail = function(){
	$(document.body).addClass('loading');
	//MailCollection.init();
	if(window.require && AccountManager.getAuth()){
		ImapClientManager.mailBox(null, function(){
			ImapClientManager.initMailboxInfo(function(){
				ImapClientManager.updateUnseenMessages();	
				$(document.body).removeClass('loading');	
			})
		});

		setTimeout(setInterval(function(){MailManager.getNewMessages()},1000 * 120), 1000 * 120);
	}
}

MailManager.getBoxInfo = function(path){
	return MailCollection.mail_box_info.findOne({path: path})
}

MailManager.getBox = function(path){
	var box = MailCollection.mail_box.findOne({path: path})
	if(!box)
		return ;
	box.info = MailManager.getBoxInfo(path);
	// console.log(box);
	return box;
}

MailManager.getBoxBySpecialUse = function(specialUse){
	var box = MailCollection.mail_box.findOne({specialUse: specialUse})
	if(!box){
		var path = specialUse.replace("\\","");
		box = MailManager.getBox(path);
	}
	if(!box)
		return ;
	box.info = MailManager.getBoxInfo(box.path);
	// console.log(box);
	return box;
}

MailManager.getOtherBoxs = function(){
	var unPath = ["Inbox", "Sent", "Drafts", "Junk", "Trash", "Archive"]

	return MailCollection.mail_box.find({path:{$nin:unPath}}).fetch();
}

MailManager.getBoxs = function(){
	return MailCollection.mail_box.find().fetch();
}

function getMessages (collection, page, page_size){
	return collection.find({},{sort: {uid:-1}, skip: page * page_size, limit: page_size}).fetch();
}

MailManager.getBoxMessagesByUids = function(uids, page, page_size){
	var path = Session.get("mailBox");
	return MailCollection.getMessageCollection(Session.get("mailBox")).find({uid:{$in: uids}}, {sort: {uid:-1}, skip: page * page_size, limit: page_size}).fetch();
}

MailManager.getboxMessages = function(page, page_size, callback){

	var messages = getMessages(MailCollection.getMessageCollection(Session.get("mailBox")), page, page_size);
	//TODO 待优化
	if(messages.length > 0){
		callback();
		return messages;
	}

	ImapClientManager.mailBoxMessages(Session.get("mailBox"), callback);

	return getMessages(MailCollection.getMessageCollection(Session.get("mailBox")), page, page_size);
}

function getMesssageBodyPart(message){
	return  message.bodyHtml? message.bodyHtml.bodyPart: message.bodyText.bodyPart
}

MailManager.getMessage = function(id){
	var path = Session.get("mailBox");
	var message = MailCollection.getMessageCollection(path).findOne(id);
	if (!message)
		return {};

	if(message.summary == true){
		
		if(Session.get("loadding") != true){
			Session.set("loadding",true);
			console.log("loadding message " + message.uid);
			ImapClientManager.getMessageByUid(path, message.uid, getMesssageBodyPart(message),function(messages){
				Session.set("loadding",false);
				console.log("set loadding is false");
				messages.forEach(function(m){
					console.log("[updateSeenMessage] uid " + m.uid +" flags: " + m.flags)
					if(m.flags.indexOf("\\Seen") == -1){
						ImapClientManager.updateSeenMessage(path, message.uid, function(){
							ImapClientManager.updateUnseenMessages();
						});
					}
				});
			});
		}
	}
	
	return message;
}

MailManager.getMessageByUid = function(path, uid){
	return MailCollection.getMessageCollection(path).findOne({uid: uid});
}

MailManager.getAttachment = function(path, uid, bodyPart, callback){
	ImapClientManager.getAttachmentByPart(path, uid, bodyPart, callback);
}

MailManager.getUnseenUid = function(){
	return MailCollection.mail_unseen.findOne();
}


/*
queryKey : {
	keyword:'',
	subject: true, 
	body: true, 
	attachment: true, 
	from: '', 
	to: '', 
	date: {
		start :yyyy-mm-dd, 
		end: yyyy-mm-dd
		}
	}
*/
MailManager.search = function(queryKey, callback){

	if(!queryKey)
		return;

	var query = {};
	
	var path = Session.get("mailBox");

	if(queryKey.keyword){
		if(queryKey.attachment)
			query.TEXT = queryKey.keyword;
		else{ 
			
			if(queryKey.body){
				query.BODY = queryKey.keyword;
			}

			if(queryKey.subject){
				query.SUBJECT = queryKey.keyword;
			}
		}
	}

	if(queryKey.from){
		query.FROM = queryKey.from;
	}

	if(queryKey.to){
		query.TO = queryKey.to;
	}
	
	//var query = {header: ['Subject', queryKey]};

	ImapClientManager.search(null, path, query, callback);
}

MailManager.getLastMessage = function(){
	var id = Session.get("mailMessageId");
	var path = Session.get("mailBox");
	
	var currentMessage = MailCollection.getMessageCollection(path).findOne(id);
	if (!currentMessage)
		return ;

	var message = MailCollection.getMessageCollection(path).findOne({uid: {$gt: currentMessage.uid}}, {sort: {uid: 1}, limit:1});
	if (!message)
		return;
	Session.set("mailMessageId",message._id);
}

MailManager.getNextMessage = function(){
	var id = Session.get("mailMessageId");
	var path = Session.get("mailBox");	
	
	var currentMessage = MailCollection.getMessageCollection(path).findOne(id);
	if (!currentMessage)
		ImapClientManager.mailBoxMessages(Session.get("mailBox"));
	
	var message = MailCollection.getMessageCollection(path).findOne({uid: {$lt: currentMessage.uid}}, {sort: {uid: -1}, limit:1});
	if (!message)
		return;
	Session.set("mailMessageId",message._id);
}

MailManager.getNewMessages = function(){
	var box = MailManager.getBox("Inbox");
	if(!box)
		return ;

	ImapClientManager.getNewMessage(box.path, function(message){
		if(message.length > 0){
			ImapClientManager.selectMailBox(null, box, {readOnly:true}, function(){
				ImapClientManager.updateUnseenMessages();
			});
		}

		messages.forEach(function(message){
			console.log("[getNewMessage] uid is " + message.uid);
		});

	});
}


MailManager.deleteMessages = function(path, uid,callback){

	return ImapClientManager.deleteMessages(null, path, uid,callback);
}



// Meteor.startup(function(){
// 	MailManager.initMail();
// })
	
