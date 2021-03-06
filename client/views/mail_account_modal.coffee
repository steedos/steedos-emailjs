Template.mailAccount.helpers

	schema: ->
		return db.mail_accounts._simpleSchema;

	doc: ->
		return db.mail_accounts.findOne({owner: Meteor.userId()})

	type: ->
		if db.mail_accounts.findOne({owner: Meteor.userId()})
			return "update";
		return "insert";

	btn_submit_i18n: ->
		return TAPi18n.__ 'OK'

Template.mailAccount.onRendered ->
	$("body").removeClass("loading")

Meteor.startup ->
	AutoForm.hooks

		updateMailAccount:
			onSuccess: (formType, result) ->
				toastr.success t('saved_successfully');
				AccountManager._auth = null;
				AccountManager.checkAccount (message)->
					if !message
						Modal.hide("mailAccount");
					else
						toastr.error(message);
						Modal.show("mailAccount");


			onError: (formType, error) ->
				if error.reason
					toastr.error error.reason
				else
					toastr.error error
