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

Session.set("mail_auth_success", false);

AccountManager.checkAccount = function(callback){
	if(Session.get("mail_auth_success")){
		return true;
	}

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
			if(!Session.get("mail_auth_success")){
				MailManager.initMail(callback);
			}

			Session.set("mail_auth_success", true);
		});

		pro.catch(function(err){
			imapClient.close();
			FlowRouter.go('/admin/view/mail_accounts');
			$(document.body).removeClass('loading');
			toastr.error("账户验证失败，错误信息：" + pro._v.message);
		});
	}catch(e){
		toastr.error("账户验证失败，错误信息：" + e.message);
		$(document.body).removeClass('loading');
		return false;
	}

	return true;
}