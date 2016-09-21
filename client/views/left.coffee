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
        key2 = "mail_" + key.toLowerCase();
        str = t(key2);

        if str == key2
            
            return t(key);

        return str;

