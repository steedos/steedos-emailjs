Template.emailjsLayout.helpers 
	
	subsReady: ->
		if Steedos.subsMail.ready()
			if !AccountManager.checkAccount()
				Modal.show("mailAccount");
			return true;
		return false;

Template.emailjsLayout.events
	"click #navigation-back": (e, t) ->
		NavigationController.back(); 
