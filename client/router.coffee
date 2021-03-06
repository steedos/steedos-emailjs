checkUserSigned = (context, redirect) ->
	if !Meteor.userId()
		FlowRouter.go '/steedos/sign-in';

# checkMailAccountIsNull = (context, redirect) ->
# 	if !AccountManager.getAuth()
# 		FlowRouter.go '/admin/view/mail_accounts';
# 		toastr.warning("请配置邮件账户");
# 		$(document.body).removeClass('loading');

checkAccountLogin = (context, redirect) ->
	AccountManager.checkAccount()
	# FlowRouter.go '/admin/view/mail_accounts';
# [ checkUserSigned, checkMailAccountIsNull, checkAccountLogin],


getNewMessages = (context, redirect) ->
	if context.path == "/emailjs" && MailCollection.email_accounts
		MailManager.getNewBoxMessages "Inbox",(messages) ->
			# MailNotification.send(messages);
			console.log(messages);


mailRoutes = FlowRouter.group
	prefix: '/emailjs',
	name: 'mailRoute',
	triggersEnter: [ checkUserSigned, getNewMessages],

mailRoutes.route '/',
	action: (params, queryParams)->
		Session.set("mailForward", false);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", "Inbox");
		Session.set("mailMessageId", null);
		Session.set("mailPage",1);
		BlazeLayout.render 'emailjsLayout',
			main: "mail_home"

mailRoutes.route '/b/:mailBox/',
	action: (params, queryParams)->
		mailBox = FlowRouter._current.path.split("/")[3] #params.mailBox
		if Session.get("mailBox") !=  mailBox
			Session.set("mailPage",1)

		Session.set("localhost_draft", false)
		# Session.set("mailLoading", true);
		Session.set("mailForward", false);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", mailBox);
		Session.set("mailMessageId", null);
		Session.set("mailBoxFilter", "");
		Session.set("mailSearchAddress", "");
		Session.set("mailMessageLoadding",false);
		Session.set("mailMessageNull",false);
		BlazeLayout.render 'emailjsLayout',
			main: "mail_home"

mailRoutes.route '/b/search/:mailBox/',
	action: (params, queryParams)->
		mailBox = FlowRouter._current.path.split("/")[4] #params.mailBox
		if Session.get("mailBox") != mailBox
			Session.set("mailPage",1)

		Session.set("mailSearch", true);
		Session.set("mailForward", false);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", mailBox);
		Session.set("mailMessageId", null);
		Session.set("mailBoxFilter", "");
		Session.set("mailMessageLoadding",false);
		Session.set("mailMessageNull",false);
		BlazeLayout.render 'emailjsLayout',
			main: "mail_home"

mailRoutes.route '/b/:mailBox/:mailMessageId',
	action: (params, queryParams)->
		mailBox = FlowRouter._current.path.split("/")[3] #params.mailBox
		if Session.get("mailBox") != mailBox
			Session.set("mailPage",1)

		Session.set("localhost_draft", false)

		Session.set("mailForward", false);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", mailBox);
		Session.set("mailMessageLoadding",false);

		Session.set("mailMessageId", params.mailMessageId);
		Session.set("isDispositionNotificationAlertNeeded", false);
		BlazeLayout.render 'emailjsLayout',
			main: "mail_home"

mailRoutes.route '/b/forward/:mailBox/:mailMessageId',
	action: (params, queryParams)->
		mailBox = FlowRouter._current.path.split("/")[4] #params.mailBox
		if Session.get("mailBox") != mailBox
			Session.set("mailPage",1)
		Session.set("mailForward", true);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", mailBox);
		Session.set("mailMessageLoadding",false);
		Session.set("mailMessageId", params.mailMessageId);
		BlazeLayout.render 'emailjsLayout',
			main: "mail_home"

mailRoutes.route '/b/reply/:mailBox/:mailMessageId',
	action: (params, queryParams)->
		mailBox = FlowRouter._current.path.split("/")[4] #params.mailBox
		if Session.get("mailBox") != mailBox
			Session.set("mailPage",1)
		Session.set("mailReply", true);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", mailBox);
		Session.set("mailMessageLoadding",false);
		Session.set("mailMessageId", params.mailMessageId);
		BlazeLayout.render 'emailjsLayout',
			main: "mail_home"

mailRoutes.route '/b/replyAll/:mailBox/:mailMessageId',
	action: (params, queryParams)->
		mailBox = FlowRouter._current.path.split("/")[4] #params.mailBox
		if Session.get("mailBox") != mailBox
			Session.set("mailPage",1)
		Session.set("mailReplyAll", true);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", mailBox);
		Session.set("mailMessageLoadding",false);
		Session.set("mailMessageId", params.mailMessageId);
		BlazeLayout.render 'emailjsLayout',
			main: "mail_home"

mailRoutes.route '/b/drafts/:mailBox/:mailMessageId',
	action: (params, queryParams)->
		mailBox = FlowRouter._current.path.split("/")[4] #params.mailBox
		if Session.get("mailBox") != mailBox
			Session.set("mailPage",1)
		Session.set("mailJumpDraft", true);
		Session.set("mailBox", mailBox);
		Session.set("mailMessageId", params.mailMessageId);
		BlazeLayout.render 'emailjsLayout',
			main: "mail_home"
