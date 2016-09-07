checkUserSigned = (context, redirect) ->
	if !Meteor.userId()
		FlowRouter.go '/steedos/sign-in';

checkMailAccountIsNull = (context, redirect) ->
	if !AccountManager.getAuth()
		FlowRouter.go '/admin/view/mail_accounts';
		toastr.warning("请配置邮件账户");

checkAccountLogin = (context, redirect) ->
	if !AccountManager.checkAccount()
		FlowRouter.go '/admin/view/mail_accounts';

mailRoutes = FlowRouter.group
	prefix: '/emailjs',
	name: 'mailRoute',
	triggersEnter: [ checkUserSigned, checkMailAccountIsNull, checkAccountLogin],

mailRoutes.route '/', 
	action: (params, queryParams)->
		Session.set("mailForward", false);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", "Inbox");
		Session.set("mailMessageId", null); 
		Session.set("mailPage",1);
		BlazeLayout.render 'masterLayout',
			main: "mail_home"

mailRoutes.route '/b/:mailBox/', 
	action: (params, queryParams)->
		Session.set("mailForward", false);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", params.mailBox); 
		Session.set("mailMessageId", null); 
		Session.set("mailPage",1);
		Session.set("mailBoxFilter", ""); 
		BlazeLayout.render 'masterLayout',
			main: "mail_home"

mailRoutes.route '/b/:mailBox/:mailMessageId', 
	action: (params, queryParams)->
		Session.set("mailForward", false);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", params.mailBox); 
		Session.set("mailMessageId", params.mailMessageId); 
		BlazeLayout.render 'masterLayout',
			main: "mail_home"

mailRoutes.route '/b/forward/:mailBox/:mailMessageId', 
	action: (params, queryParams)->
		Session.set("mailForward", true);
		Session.set("mailReply", false);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", params.mailBox); 
		Session.set("mailMessageId", params.mailMessageId); 
		BlazeLayout.render 'masterLayout',
			main: "mail_home"

mailRoutes.route '/b/reply/:mailBox/:mailMessageId', 
	action: (params, queryParams)->
		Session.set("mailReply", true);
		Session.set("mailReplyAll", false);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", params.mailBox); 
		Session.set("mailMessageId", params.mailMessageId); 
		BlazeLayout.render 'masterLayout',
			main: "mail_home"

mailRoutes.route '/b/replyAll/:mailBox/:mailMessageId', 
	action: (params, queryParams)->
		Session.set("mailReplyAll", true);
		Session.set("mailJumpDraft", false);
		Session.set("mailBox", params.mailBox); 
		Session.set("mailMessageId", params.mailMessageId); 
		BlazeLayout.render 'masterLayout',
			main: "mail_home"

mailRoutes.route '/b/jumpDraft/:mailBox/:mailMessageId', 
	action: (params, queryParams)->
		Session.set("mailJumpDraft", true);
		Session.set("mailBox", params.mailBox); 
		Session.set("mailMessageId", params.mailMessageId); 
		BlazeLayout.render 'masterLayout',
			main: "mail_home"






