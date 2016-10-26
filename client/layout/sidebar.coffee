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

    accountName: ->
        account = db.mail_accounts.findOne()
        if account
            return account.email

    boxName: ->
        Session.get("mailInit");
        if Session.get("box")
            return t(Session.get("box"))

    boxActive: (box)->
        Session.get("mailInit");
        if box == Session.get("box")
            return "active"

    getBox: (path)->
        Session.get("mailInit");
        return MailManager.getBox(path);

    getBoxBySpecialUse: (specialUse)->
        Session.get("mailInit");
        return MailManager.getBoxBySpecialUse(specialUse);

    getOtherBoxs: ()->
        Session.get("mailInit");
        return MailManager.getOtherBoxs();

    getUnseenCount: ->
        Session.get("mailInit");
        return MailManager.getUnseenUid().uids.length;

    getLiClass: (path)->
        Session.get("mailInit");
        return if path == Session.get("mailBox") then "active" else ""

    t:(key)->
        return MailManager.i18n(key);
    
    box: ->
        if Session.get("mailInit")
            return MailManager.getBox(Session.get("mailBox"));

    firstOutBox: (index) ->
        if index == 0
            return "first-other-box"
        return "";

Template.emailjsSidebar.events
    'click .main-header .logo': (event) ->
        Modal.show "app_list_box_modal"

    "click .box-item-info": (e, t) ->
        FlowRouter.go(e.currentTarget.dataset.href);

        Session.set("mailLoading",true);
        MailManager.getNewBoxMessages Session.get("mailBox"), () ->
            Session.set("mailLoading",false);

    "click .mail-add-btn": (e, t) ->
        FlowRouter.go(e.currentTarget.dataset.href);

        FlowRouter.go(e.currentTarget.dataset.href + "/compose");

    "click .settings-mail-account": (e, t)->
        Modal.show("mailAccount");

    "dragenter .sidebar-menu .drag-target": (e, t) ->
        console.log "drag-target dragenter"

    "dragover .sidebar-menu .drag-target": (e, t) ->
        console.log "drag-target dragover"
        e.preventDefault()

    "drop .sidebar-menu .drag-target": (e, template) ->
        console.log "drag-target drop"
        uids = Template.mail_list.getCheckedUids()
        fromPath = Session.get("mailBox")
        toPath = $(e.currentTarget).find(".box-item-info")[0]?.dataset?.path
        toBox = MailManager.getBox(toPath)
        if toBox && uids.length
            MailManager.moveMessages uids,fromPath,toPath,->
                console.log "MailManager.moveMessages execute successfully"
                toastr.success(t("mail_removeto_success", MailManager.i18n(toBox.name)))

        return false