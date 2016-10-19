Template.emailjsLayout.helpers 
	
	subsReady: ->
		if Steedos.subsMail.ready()
			$(document.body).addClass('loading');
			if !AccountManager.checkAccount()
				FlowRouter.go '/admin/view/mail_accounts';
			return true;
		return false;

Template.emailjsLayout.events
	"click #navigation-back": (e, t) ->
		NavigationController.back(); 
