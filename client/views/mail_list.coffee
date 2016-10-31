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

    isSentOrDrafts: ->
        path = Session.get("mailBox");
        if path == 'Sent' || MailManager.getBoxBySpecialUse(path)?.specialUse == '\\Sent' || path == 'Drafts' || MailManager.getBoxBySpecialUse(path)?.specialUse == '\\Drafts'
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

    oneToName: (to)->
      return if to[0].name then to[0].name else to[0].address

    onlyOneTo: (to)->
      if to.length == 1
          return true;
      return false;

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
