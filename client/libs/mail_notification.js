MailNotification = {};

MailNotification._sound = new Audio("/sound/notification.mp3");
MailNotification._timeout = 6 * 1000

MailNotification.send = function(messages){
	if(messages.length > 0){
		var title, body, openUrl;
		var inboxPath = MailManager.getBoxBySpecialUse("\\Inbox").path;
		var emailjsPath = "/emailjs/b/" + inboxPath + "/";
		
		// 抚顺分支emailjs跳转到webmail
		if (Meteor.settings.public && Meteor.settings.public.fsshWebMail){
			emailjsPath = "/fssh/webmail?uid=";
		}
		
		if(messages.length > 1){
	    	title = "新邮件";
	    	body = "您有" + messages.length + "封新邮件";
	    	openUrl = emailjsPath;
	    }else{
	        var envelope = messages[0]["envelope"];
	        var uid = messages[0].uid;
	        if(envelope){
		        var from = envelope.from;
				if (from[0].name)
					title = from[0].name;
				else
					title = from[0].address;
				body = envelope.subject;
			}
			openUrl = emailjsPath + uid;
	    }
	    var options = {
	        iconUrl: Meteor.absoluteUrl() + "images/apps/workflow/AppIcon48x48.png",
	        title: title,
	        body: body,
	        timeout: MailNotification._timeout
		}
		options.onclick = function(){
			// var domainsArr = FlowRouter._current.path.split("/");

			FlowRouter.go(openUrl);

			// if (domainsArr[1] && (domainsArr[1] == "emailjs")){
			// 	FlowRouter.go(openUrl);
			// }else{
			// 	Steedos.openWindow(openUrl);
			// }
		}
	    $.notification(options);
	    // 任务栏高亮显示
	    nw.Window.get().requestAttention(3);
		
		MailNotification._sound.play();
		return;
	}
}
