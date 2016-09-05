MailCollection = {};

MailCollection.init = function(){
	MailCollection.mail_box = new Mongo.Collection();

	MailCollection.mail_box_info = new Mongo.Collection();

	MailCollection.mail_unseen = new Mongo.Collection();

	MailCollection.mail_search = new Mongo.Collection();

	MailCollection.mail_unseen.insert({uids:[]});

	MailCollection.mail_search.insert({uids:[]});
}

MailCollection.getMessageCollection = function(path){
	if(typeof(MailCollection["mail_" + path + "_messages"]) != 'object'){
		console.log("new [mail_" + path + "_messages] collection");
		MailCollection["mail_" + path + "_messages"] = new Mongo.Collection();
	}
	return MailCollection["mail_" + path + "_messages"];
}


Meteor.startup(function(){
	MailCollection.init();
})