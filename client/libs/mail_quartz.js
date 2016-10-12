MailQuartz = {};

MailQuartz.intervalId = null;

MailQuartz.getNewMessages = function(){
	console.log("MailQuartz.getNewMessages run...");

	if(MailQuartz.intervalId !=null){
		clearInterval(MailQuartz.intervalId);
	}

	//MailQuartz.intervalId = setInterval(function(){MailManager.getNewBoxMessages("Inbox")},1000 * 120);
}
