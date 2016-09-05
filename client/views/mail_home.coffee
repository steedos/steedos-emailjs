Template.mail_home.helpers
    equals: (a,b) ->
        return (a == b)

    t:(key)->
    	return t("mail_" + key.toLowerCase());
        
Template.mail_home.onRendered ->
    # MailManager.initImapClient();