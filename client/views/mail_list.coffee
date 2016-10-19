Template.mail_list.getCheckedUids = ()->
    uids = new Array();
    $('input[name="uids"]', $(".mailbox-messages")).each ->
        if $(this).prop('checked')
            uids.push($(this).val());

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
            console.info("mail_list_load show");
            $("#mail_list_load").show();
        else
            console.info("mail_list_load hide");
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
        Session.set("mailLoading",true);
        path = Session.get("mailBox");
        uids = Template.mail_list.getCheckedUids();

        MailManager.judgeDelete(path, uids);

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

        FlowRouter.go(event.currentTarget.dataset.href);

Template.mail_list.onRendered ->
    console.log("Template.mail_list.onRendered run...");
    $("#mail_list_load").show();
    $(".mailbox-messages").perfectScrollbar();
