Template.mail_list.getCheckedUids = ()->
    uids = new Array();
    $('input[name="uids"]', $(".mailbox-messages")).each ->
        if $(this).prop('checked')
            uids.push(parseInt($(this).val()));

    return uids;

Template.mail_list.helpers
    t:(key)->
        key2 = "mail_" + key.toLowerCase();
        str = t(key2);

        if str == key2

            return t(key);

        return str;

    box: ->
        return MailManager.getBox(Session.get("mailBox"));

    isDraftsBox: ->
        path = Session.get("mailBox");
        if path == 'Drafts' || MailManager.getBoxBySpecialUse(path)?.specialUse == '\\Drafts'
            return  true
        return false

    boxExists: ->
        if Session.get("mailInit") && Session.get("mailBoxInit")
            if Session.get("mailBoxFilter")
                return Session.get("mailBoxFilter").length;
            box = MailManager.getBox(Session.get("mailBox"));
            return box?.info?.exists;

    boxName: ->
        if Session.get("mailBox")
            console.log("mail_" + Session.get("mailBox"));
            console.log(t("mail_" + Session.get("mailBox")));
            return t("mail_" + Session.get("mailBox"))
        else
            return t("mail_inbox")

    isLoading: ->
        if Session.get("mailLoading")
            $("#mail_list_load").show();
        else
            $("#mail_list_load").hide();
        return Session.get("mailLoading");

    boxMessages: ->
        console.log("[boxMessages]");
        Session.set("mailLoading",true);
        path = Session.get("mailBox");

        rev ;
        if Session.get("mailInit")
            inbox = MailManager.getBox(path);
            ImapClientManager.initMailboxInfo inbox, ()->
                Session.set("mailBoxInit", true);
                console.log("ImapClientManager.initMailboxInfo ok...");

            if Session.get("mailBoxInit")
                if Session.get("mailBoxFilter")
                  rev = MailManager.getBoxMessagesByUids Session.get("mailBoxFilter"), Session.get("mailPage")-1, MailPage.pageSize, ()->
                    Session.set("mailLoading",false);
                else
                  rev = MailManager.getboxMessages Session.get("mailPage")-1, MailPage.pageSize, () ->
                    Session.set("mailLoading",false);
        return rev;

    isUnseen: (message)->
        if(message?.flags?.indexOf("\\Seen") == -1)
            return true;
        return false;

    modifiedString: (date)->
        modifiedString = moment(date).format('YYYY-MM-DD HH:mm')
        return modifiedString;

    modifiedFromNow: (date)->
        # $(".mailbox-messages img").initial({charCount:1});
        modifiedFromNow = moment(date).fromNow();
        return modifiedFromNow;

    haveAttachment: (attachments)->
        if attachments.length > 0
            return true;
        return false;

    pageStart: ->
        return  MailPage.PageStart();

    pageEnd: (boxMessageNumber)->
        pageEnd = MailPage.PageEnd(boxMessageNumber);
        return  pageEnd;

    fromName: (from)->
        if(from && from.length > 0)
            return if from[0].name then from[0].name else from[0].address

    getLiClass: (uid)->
        return if uid+"" == Session.get("mailMessageId") then "active" else ""

    minHeight: ->
        return Template.instance().minHeight.get() + "px"


Template.mail_list.events
    'click .list-refresh': (event, template) ->
        Session.set("mailLoading",true);
        path = Session.get("mailBox");
        MailManager.getNewBoxMessages path, () ->
            Session.set("mailLoading",false);

    'click .list-message-delete': (event, template) ->

        path = Session.get("mailBox");
        uids = Template.mail_list.getCheckedUids();

        if uids && uids.length > 0
            Session.set("mailLoading",true);
            MailManager.judgeDelete path, uids,()->
              Session.set("mailLoading",false);
        else
            toastr.warning("请先选择需要删除的邮件");

    'click #page_forward': (event, template) ->
        MailPage.pageForward(parseInt(template.firstNode.dataset.exists));

    'click #page_back': (event, template) ->
        MailPage.pageBack(parseInt(template.firstNode.dataset.exists));

    #'keydown .search-mail': (event, template) ->
    #    console.log("keydown mail-search" + event.keyCode);

    'change .mailbox-messages-checkAll': (event, template) ->
        $('input[name="uids"]', $(".mailbox-messages")).each ->
            $(this).prop('checked', event.target.checked);

        $('.mailbox-messages-checkAll').each ->
            $(this).prop('checked', event.target.checked);

    'click .steedos-emailjs-item': (event, template)->
        if event.currentTarget.dataset.drafts == "true"
            FlowRouter.go("/emailjs/b/" + event.currentTarget.dataset.box);
        if event.currentTarget.dataset.uid == Session.get("mailMessageId")
            FlowRouter.go(event.currentTarget.dataset.href);
        else
            FlowRouter.go(event.currentTarget.dataset.href + event.currentTarget.dataset.uid);

    'selectstart .products-list .drag-source': (event, template)->
        console.log "drag-source selectstart"
        return false

    'dragstart .products-list .drag-source': (event, template)->
        console.log "drag-source dragstart"
        checkbox = $(event.currentTarget).find(".product-checkbox input[type=checkbox]")
        unless checkbox.is(':checked')
            checkbox.click()
        event.originalEvent.dataTransfer.effectAllowed = "move"
        cursorIcon = $('<img src="data:image/png;base64,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" />');
        event.originalEvent.dataTransfer.setDragImage(cursorIcon[0], 16, 15);

    'ondragend .products-list .drag-source': (event, template)->
        console.log "drag-source ondragend"
        return false


Template.mail_list.onRendered ->
    console.log("Template.mail_list.onRendered run...");
    if Session.get("mailLoading") || Session.get("mailLoading") == undefined
        $("#mail_list_load").show();

    $(".mailbox-messages").perfectScrollbar();
