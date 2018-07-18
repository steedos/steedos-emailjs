MailQuartz = {};

MailQuartz.intervalId = null;

MailQuartz._millisec = 1000 * 60 * 10;

MailQuartz.getNewMessages = function(){
	console.log("MailQuartz.getNewMessages run...");

	if(MailQuartz.intervalId !=null){
		clearInterval(MailQuartz.intervalId);
	}

	MailQuartz.intervalId = setInterval(function(){
		MailManager.getNewBoxMessages("Inbox",function(messages){
			LocalhostBox.write("Inbox");
			MailNotification.send(messages);
		});
	},MailQuartz._millisec);
}