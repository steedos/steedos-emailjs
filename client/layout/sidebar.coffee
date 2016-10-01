Template.emailjsSidebar.helpers

	apps: ()->
		return Steedos.getSpaceApps()
		
	displayName: ->

		if Meteor.user()
			return Meteor.user().displayName()
		else
			return " "
	 
	avatar: ->
		return Meteor.absoluteUrl("/avatar/" + Meteor.userId());

	spaceId: ->
		if Session.get("spaceId")
			return Session.get("spaceId")
		else
			return localStorage.getItem("spaceId:" + Meteor.userId())

	menuClass: (app_id)->
		path = Session.get("router-path")
		if path?.startsWith "/" + app_id or path?.startsWith "/app/" + app_id
			return "active";


	boxName: ->
		if Session.get("box")
			return t(Session.get("box"))

	boxActive: (box)->
		if box == Session.get("box")
			return "active"

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
    
    box: ->
        return MailManager.getBox(Session.get("mailBox"));
