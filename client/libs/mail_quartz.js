MailQuartz = {};

MailQuartz.intervalId = null;

MailQuartz._millisec = 1000 * 60 * 10;

MailQuartz.getNewMessages = function(){
	console.log("MailQuartz.getNewMessages run...");

	if(MailQuartz.intervalId !=null){
		clearInterval(MailQuartz.intervalId);
	}

	MailQuartz.intervalId = setInterval(function(){
		if (MailState.value  == "sending"){
			return;
		}

		// 邮件状态设置
		MailState.value = 1;
		
		MailManager.getNewBoxMessages("Inbox",function(messages){
			LocalhostBox.write("Inbox");
			MailNotification.send(messages);
			// 状态设置回 无操作
			MailState.value = 0;
		});
	},MailQuartz._millisec);
}