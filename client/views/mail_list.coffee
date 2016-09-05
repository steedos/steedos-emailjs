Template.mail_list.helpers
    t:(key)->
        key2 = "mail_" + key.toLowerCase();
        str = t(key2);

        if str == key2
            
            return t(key);

        return str;

    box: ->
        return MailManager.getBox(Session.get("mailBox"));

    boxExists: ->
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

    boxMessages: ->
        $("#mail_list_load").show();

        rev ;

        if Session.get("mailBoxFilter")
            rev = MailManager.getBoxMessagesByUids(Session.get("mailBoxFilter"), Session.get("mailPage")-1, MailPage.pageSize);

        rev = MailManager.getboxMessages Session.get("mailPage")-1, MailPage.pageSize, () ->
          $("#mail_list_load").hide()
          console.log("mail_list_load hide");

        return rev;

    isUnseen: (message)->
        if(message?.flags?.indexOf("\\Seen") == -1)
            return true;
        return false;

    modifiedString: (date)->
        modifiedString = moment(date).format('YYYY-MM-DD HH:mm')
        return modifiedString;

    modifiedFromNow: (date)->
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


Template.mail_list.events

    'click #page_forward': (event, template) ->
        MailPage.pageForward(parseInt(template.firstNode.dataset.exists));

    'click #page_back': (event, template) ->
        MailPage.pageBack(parseInt(template.firstNode.dataset.exists));

    'keydown .search-mail': (event, template) ->
        console.log("keydown mail-search" + event.keyCode);

    'keydown .search-mail-input': (event, template) ->
        if event.keyCode == 13
            searchKey = event.target.value

            if searchKey.trim() == ''
                Session.set("mailBoxFilter","");
                return;

            Session.set("mailLoading",true);
            console.log("keydown search-mail-input searchKey:" + searchKey);
            MailManager.search searchKey, (result,messages) ->
                Session.set("mailBoxFilter", result);
                Session.set("mailLoading",false);

Template.mail_list.onRendered ->
    console.log("Template.mail_list.onRendered run...");
    $("#mail_list_load").hide();