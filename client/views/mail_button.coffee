Template.mailButton.helpers
    message: ->
        uid = Session.get("mailMessageId");

        return MailManager.getMessage(parseInt(uid)) ;

    isComPose: ->
        console.log("isComPose");
        console.log(Session);
        return Session.get("mailBox") == "compose" || Session.get("mailForward") || Session.get("mailReply") || Session.get("mailReplyAll") || Session.get("mailJumpDraft")

    path: ->
        return Session.get("mailBox");


Template.mailButton.events
    'click .add_cc': (event, template) ->
        $(".mail_cc").show();
        $(".remove_cc").css("display","inline-block");
        $(".add_cc").hide();

    'click .remove_cc': (event, template) ->
        $(".mail_cc").hide();
        $(".add_cc").css("display","inline-block");
        $(".remove_cc").hide();

    'click .add_bcc': (event, template) ->
        $(".mail_bcc").show();
        $(".remove_bcc").css("display","inline-block");
        $(".add_bcc").hide();

    'click .remove_bcc': (event, template) ->
        $(".mail_bcc").hide();
        $(".add_bcc").css("display","inline-block");
        $(".remove_bcc").hide();

    'click #compose-send': (event)->
        $("#mail_sending").show();
        if $("#mail_to").val() == null || $("#mail_to").val().length < 1
            toastr.warning("请填写收件人")
            return

        attachments = new Array();

        $('[name="mail_attachment"]').each ->
            attachments.push
                name: @dataset.name
                path: @dataset.path

        SmtpClientManager.sendMail $("#mail_to").val(), $("#mail_cc").val(), $("#mail_bcc").val(), $(".form-control.subject").val(), $('#compose-textarea').summernote('code'), attachments, ()->
          $("#mail_sending").hide();

    'click #compose-draft': (event)->
        $("#mail_sending").show();
        attachments = new Array();

        $('[name="mail_attachment"]').each ->
            attachments.push
                name: @dataset.name
                path: @dataset.path

        message = MailMimeBuilder.getMessageMime(AccountManager.getAuth().user ,$("#mail_to").val(),$("#mail_cc").val(), $("#mail_bcc").val(),$(".form-control.subject").val(), $('#compose-textarea').summernote('code') ,attachments);

        ImapClientManager.upload null, MailManager.getBoxBySpecialUse("\\Drafts").path, message, ()->
            toastr.success("存草稿成功");
            $("#mail_sending").hide();

    'click .mail-delete': (event, template)->
        console.log("click mail-delete");
        path = Session.get("mailBox");

        message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))

        uid = message.uid;

        MailManager.judgeDelete(path, [uid]);

    'click #right_back': (event)->
        backURL =  "/emailjs/b/" + Session.get("mailBox")
        FlowRouter.go(backURL)
        Session.set("mailLoading",false);
