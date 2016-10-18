AccountManager = {};


AccountManager.getAuth = function(){

	var mail_account = db.mail_accounts.findOne();
	if(!mail_account)
		return ;
	return {user: mail_account.email,pass: mail_account.password};
}

AccountManager.getMailDomain = function(user){
	user_domain = user.split("@")[1];
	return db.mail_domains.findOne({domain: user_domain});
	// return {domain:"@hotoa.com",imap:"imap.mxhichina.com",imap_port:143,smtp:"smtp.mxhichina.com",smtp_port:25}
	//return {domain:"@petrochina.com.cn",imap:"msg.petrochina.com.cn",imap_port:993,smtp:"msg.petrochina.com.cn",smtp_port:465}
}

AccountManager.checkAccount = function(callback){

	$(document.body).addClass('loading');

	try{
		console.log("AccountManager.checkAccount...");
		var userAuth = AccountManager.getAuth();

		if(!AccountManager.getMailDomain(userAuth.user)){
			toastr.error("账户验证失败, 无效的邮件域名");
			$(document.body).removeClass('loading');
			return false;
		}

		var imapClient = ImapClientManager.getClient();
		var pro = imapClient.connect();

		pro.then(function(){
			
			imapClient.close();

			console.log("账户验证完成");

			var email_accounts = null;
			if(MailCollection.email_accounts)
				email_accounts = MailCollection.email_accounts.findOne({account:userAuth.user});

			if(!email_accounts){
				
				Session.set("email_account", userAuth.user);

				MailCollection.destroy();

				MailCollection.create("email_accounts");

				MailCollection.email_accounts.insert({});

				MailManager.initMail(callback);
			}else{
				$(document.body).removeClass('loading');
			}
		});

		pro.catch(function(err){
			imapClient.close();
			FlowRouter.go('/admin/view/mail_accounts');
			$(document.body).removeClass('loading');
			toastr.error("账户验证失败，错误信息：" + err.message);
		});
	}catch(e){
		toastr.error("账户验证失败，错误信息：" + e.message);
		$(document.body).removeClass('loading');
		return false;
	}

	return true;
}