Template.emailjsSidebar.helpers

    apps: ()->
        return Steedos.getSpaceApps()

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

    getLiClass: (path,isDroppable)->
        Session.get("mailInit");
        if isDroppable
            return if path == Session.get("mailBox") then "active" else "drag-target"
        else
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

    "click .box-item-info": (event, template) ->
        $(".steedos-mail").removeClass("right-show")
        FlowRouter.go(event.currentTarget.dataset.href);

        Session.set("mailLoading",true);
        MailManager.getNewBoxMessages Session.get("mailBox"), () ->
            Session.set("mailLoading",false);

    "click .mail-add-btn": (event, template) ->
        FlowRouter.go(event.currentTarget.dataset.href);

        FlowRouter.go(event.currentTarget.dataset.href + "/compose");

    "click .settings-mail-account": (event, template)->
        Modal.show("mailAccount");

    "dragenter .sidebar-menu .drag-target": (event, template) ->
        console.log "drag-target dragenter"
        target = $(event.currentTarget)
        toPath = target.find(".box-item-info").data("path")
        # 要拖动到的目标路径正好是当前所在箱则不需要处理active样式
        unless toPath == Session.get("mailBox")
            target.addClass("active")

    "dragleave .sidebar-menu .drag-target": (event, template) ->
        console.log "drag-target dragleave"
        target = $(event.currentTarget)
        toPath = target.find(".box-item-info").data("path")
        # 要拖动到的目标路径正好是当前所在箱则不需要处理active样式
        unless toPath == Session.get("mailBox")
            target.removeClass("active")

    "dragover .sidebar-menu .drag-target": (event, template) ->
        console.log "drag-target dragover"
        event.preventDefault()

    "drop .sidebar-menu .drag-target": (event, template) ->
        console.log "drag-target drop"
        target = $(event.currentTarget)
        uids = Template.mail_list.getCheckedUids()
        fromPath = Session.get("mailBox")
        toPath = target.find(".box-item-info").data("path")
        # 要拖动到的目标路径正好是当前所在箱则不需要处理active样式
        unless toPath == Session.get("mailBox")
            target.removeClass("active")
        
        toBox = MailManager.getBox(toPath)
        if toBox && uids.length
            MailManager.moveMessages uids,fromPath,toPath,->
                MailManager.getNewBoxMessages fromPath, ->
                    console.log "MailManager.moveMessages execute successfully"
                    toastr.success(t("mail_removeto_success", MailManager.i18n(toBox.name)))

        return false