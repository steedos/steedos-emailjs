Template.mail_compose.helpers
    mail_to: () ->
        console.log("mail_to...")

        rev = {name: "mail_to", title: '收件人', atts:{id: "mail_to", name: "mail_to"}};

        message = MailManager.getMessage(Session.get("mailMessageId"));

        if Session.get("mailMessageId")
            if Session.get("mailJumpDraft")
                rev.values = message.to;
            else if Session.get("mailReply")
                rev.values = message.from;
            else if Session.get("mailReplyAll")
                to = message.from.concat(message.to);
                
                fromUserAddress = to.filterProperty("address", AccountManager.getAuth().user);

                fromUserAddress.forEach (address)->
                    to.remove(to.indexOf(address));

                rev.values = to;

        return rev;

    mail_cc: () ->
        rev = {name: "mail_cc", title: '抄&emsp;送', atts:{id: "mail_cc", name: "mail_cc"}};

        message = MailManager.getMessage(Session.get("mailMessageId"));

        if Session.get("mailMessageId")
            if Session.get("mailJumpDraft")
                rev.values  = message.cc;
            else if Session.get("mailReplyAll")
                rev.values  = message.cc;
           
        return rev;

    mail_bcc: () ->
        return rev = {name: "mail_bcc", title: '密&emsp;送', atts:{id: "mail_bcc", name: "mail_bcc"}};

    subject: () ->
        if Session.get("mailMessageId")
            message = MailManager.getMessage(Session.get("mailMessageId"));
            subject = message.subject;
            if Session.get("mailJumpDraft")
                return subject;
            else if Session.get("mailForward")
                return "转发: " + subject;
            else if Session.get("mailReply") || Session.get("mailReplyAll") 
                return "回复: " + subject;  

        return "";

    body: () ->
        if Session.get("mailMessageId")
            message = MailManager.getMessage(Session.get("mailMessageId"));
            if Session.get("mailJumpDraft")
                console.log("mailJumpDraft：bodyHtml.data" + message.bodyHtml.data)
                return message.bodyHtml.data;

            return  MailForward.getBody(message);
         
        return " 内";

Template.mail_compose.events
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

    'change #attachment_file': (event, template) ->
        if !$("#attachment_file").val()
            return ;
        node = MailAttachment.getAttachmentNode($("#attachment_file").val());
        $("#compose_attachment_list").append(node);
        $("#attachment_file").val('')

    'click .mailbox-attachment-delete': (event)->
        event.target.parentNode.parentNode.parentNode.remove();
    
    'click #compose-send': (event)->
        if $("#mail_to").val() == null || $("#mail_to").val().length < 1
            toastr.warning("请填写收件人")
            return 

        console.log("--------------compose-send-----------------")
        attachments = new Array();

        $('[name="mail_attachment"]').each ->
            attachments.push
                name: @dataset.name
                path: @dataset.path

        SmtpClientManager.sendMail($("#mail_to").val(), $("#mail_cc").val(), $("#mail_bcc").val(), $(".form-control.subject").val(), $('#compose-textarea').summernote('code'), attachments);

    'click #compose-draft': (event)->
        console.log("--------------compose-draft-----------------")

        attachments = new Array();

        $('[name="mail_attachment"]').each ->
            attachments.push
                name: @dataset.name
                path: @dataset.path

        message = MailMimeBuilder.getMessageMime(AccountManager.getAuth().user ,$("#mail_to").val(),$("#mail_cc").val(), $("#mail_bcc").val(),$(".form-control.subject").val(), $('#compose-textarea').summernote('code') ,attachments);

        ImapClientManager.upload null, MailManager.getBox("Drafts").path, message, ()->
            toastr.success("暂存成功");

Template.mail_compose.onRendered ->
    if Session.get("mailMessageId") 
        if Session.get("mailForward") || Session.get("mailJumpDraft")
            MailForward.getAttachmentsHtml();

    if $("#mail_cc").val()?.length > 0
        $(".add_cc").click()

    $("#compose-textarea").summernote
        lang: "zh-CN"
        dialogsInBody: true






