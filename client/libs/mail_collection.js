MailCollection = {};

MailCollection.before = {};

MailCollection.keys = new Array();

MailCollection.before.insert = function(userId, doc){
	doc.account = Session.get("email_account")
}

MailCollection.before.update = function(userId, doc){
	doc.account = Session.get("email_account")
}

MailCollection.create = function(key){
	if(!MailCollection.keys.includes(key)){

		MailCollection[key] = new Mongo.Collection();

		MailCollection[key].before.insert(MailCollection.before.insert);

		MailCollection[key].before.update(MailCollection.before.update);

		MailCollection.keys.push(key);
	}

	return MailCollection[key];
}


MailCollection.init = function(){

	MailCollection.create("mail_box");

	MailCollection.create("mail_box_info");

	MailCollection.create("mail_unseen");

	MailCollection.create("mail_search");

	MailCollection.mail_unseen.insert({uids:[]});

	MailCollection.mail_search.insert({uids:[]});
}

MailCollection.getMessageCollection = function(path){

	var key = "mail_" + path + "_messages";

	return MailCollection.create(key);
}

MailCollection.searchMessageCollection = function(path){

	var key = "mail_" + path + "_messages";

	return MailCollection.create(key);
}

MailCollection.unseenCollection = function(){

	var key = "mail_" + "unseen" + "_messages";

	return MailCollection.create(key);
}


//selector: {"flags":{$ne:"\\Seen"}}
//options: {sort: {uid:-1}, skip: 0, limit: 5}
MailCollection.getInboxMessage = function(selector, options){
	var inboxPath = MailManager.getBoxBySpecialUse("\\Inbox").path;

    var conn = MailCollection.getMessageCollection(inboxPath);

    var messages = conn.find(selector, options).fetch();

    messages.forEach()
}


MailCollection.destroy = function(){


	MailCollection.keys.forEach(function(key){
		MailCollection[key] = null;
	})

	MailCollection.keys = new Array();

	MailCollection.init();
}

Meteor.startup(function(){
	MailCollection.init();
})
