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


Template.layout_left.onRendered ->
#Template.layout_left.events
  # 'click .mailBox-refresh': (event, template) ->
    debugger
    console.log("layout_left button mailbox ..... ");
    Session.set("mailLoading",true);
    path = Session.get("mailBox");
    MailManager.getNewBoxMessages(path);
