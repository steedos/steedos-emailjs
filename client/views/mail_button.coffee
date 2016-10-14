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
      Session.set("mailSending",true);
      if MailManager.getContacts("mail_to") == null || MailManager.getContacts("mail_to").length < 1
          toastr.warning("请填写收件人")
          Session.set("mailSending",false);
          return

      attachments = new Array();

      $('[name="mail_attachment"]').each ->
          attachments.push
              name: @dataset.name
              path: @dataset.path

      SmtpClientManager.sendMail MailManager.getContacts("mail_to"), MailManager.getContacts("mail_cc"), MailManager.getContacts("mail_bcc"), $(".form-control.subject").val(), $('#compose-textarea').summernote('code'), attachments, ()->
        Session.set("mailSending",false)
        FlowRouter.go('/emailjs/b/' + Session.get("mailBox"))
        Session.set("mailLoading",false)

  'click #compose-draft': (event)->
      Session.set("mailSending",true);
      attachments = new Array();

      $('[name="mail_attachment"]').each ->
          attachments.push
              name: @dataset.name
              path: @dataset.path

      message = MailMimeBuilder.getMessageMime(AccountManager.getAuth().user ,MailManager.getContacts("mail_to"), MailManager.getContacts("mail_cc"), MailManager.getContacts("mail_bcc"), $(".form-control.subject").val(), $('#compose-textarea').summernote('code') ,attachments);

      ImapClientManager.upload null, MailManager.getBoxBySpecialUse("\\Drafts").path, message, ()->
        Session.set("mailSending",false);
        toastr.success("存草稿成功");

  'click .mail-delete': (event, template)->
      console.log("click mail-delete");
      path = Session.get("mailBox");

      message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))

      uid = message.uid;

      MailManager.judgeDelete(path, [uid]);

  'click #right_back': (event)->
      backURL =  "/emailjs/b/" + Session.get("mailBox")
      FlowRouter.go(backURL)
      Session.set("mailLoading",false)
