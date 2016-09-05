Template.layout_left.helpers
    getBox: (path)->
    	return MailManager.getBox(path);

    getBoxBySpecialUse: (specialUse)->
    	return MailManager.getBoxBySpecialUse(specialUse);

    getOtherBoxs: ()->
    	return MailManager.getOtherBoxs();

    getUnseenCount: ->
    	return MailManager.getUnseenUid().uids.length;

    getLiClass: (path)->
    	return if path == Session.get("mailBox") then "active" else ""

    t:(key)->
    	return t("mail_" + key.toLowerCase());

