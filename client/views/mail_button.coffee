Template.mailButton.helpers
	isComPose: ->
		return Session.get("mailMessageId") == "compose" || Session.get("mailForward") || Session.get("mailReply") || Session.get("mailReplyAll") || Session.get("mailJumpDraft")

	message: ->
		if Session.get("mailInit")
			return MailManager.getMessage(parseInt(Session.get("mailMessageId"))) ;

	path: ->
		return Session.get("mailBox");

	isSending: ->
		return Session.get("mailSending");

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
				size: parseFloat(@dataset.fileSize)

		to = MailManager.getContacts("mail_to");
		cc = MailManager.getContacts("mail_cc");
		bcc = MailManager.getContacts("mail_bcc");
		subject = $(".subject", $(".mail-compose")).val();
		body = $('#compose-textarea').summernote('code');
		isDispositionNotification = $("#ckb_disposition_notification").is(':checked')

		if !Session.get("mailIsRunbeforSend")
			Session.set("mailContinueSend",false); #是否继续
			Session.set("mailIsRunbeforSend",false); # 是否运行了beforeSend

		SmtpClientManager.beforeSendFilter(to, cc, bcc, subject, body, attachments);

		console.log("Session mailContinueSend is" + Session.get("mailContinueSend"));
		if Session.get("mailContinueSend")
			SmtpClientManager.sendMail to, cc, bcc, subject, body, attachments, isDispositionNotification, ()->
				path = Session.get("mailBox")

				if path == 'Drafts' || MailManager.getBoxBySpecialUse(path).specialUse == '\\Drafts'
					uid = Session.get("mailMessageId")
					MailCollection.getMessageCollection(path).remove({uid:parseInt(uid)});

					FlowRouter.go('/emailjs/b/' + path);
					MailManager.updateBoxInfo(path);
				else
					FlowRouter.go('/emailjs/b/' + path);
					$(".steedos-mail").removeClass("right-show");

		Session.set("mailSending",false)

	'click #compose-draft': (event)->
		Session.set("mailSending",true);
		attachments = new Array();

		$('[name="mail_attachment"]').each ->
			attachments.push
				name: @dataset.name
				path: @dataset.path
				size: parseFloat(@dataset.fileSize)

		to = MailManager.getContacts("mail_to");
		cc = MailManager.getContacts("mail_cc");
		bcc = MailManager.getContacts("mail_bcc");
		subject = $(".subject", $(".mail-compose")).val();
		body = $('#compose-textarea').summernote('code');

		Session.set("mailIsRunbeforSave",false);
		SmtpClientManager.beforeSaveFilter(to, cc, bcc, subject, body, attachments);

		if Session.get("mailIsRunbeforSave")
			message = MailMimeBuilder.getMessageMime(AccountManager.getAuth().user , to, cc, bcc, subject, body,attachments);

			console.log("click #compose-draft ....")

			MailManager.saveDrafts(message);


	'click .mail-delete': (event, template)->
		console.log("click mail-delete");
		path = Session.get("mailBox");

		message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))

		uid = message.uid;
		$(".steedos-mail").removeClass("right-show")
		MailManager.judgeDelete(path, [uid]);


	'click .mail-code-download': (event, template)->
		console.log("----mailbox-attachment-name------")
		Session.set("mailSending",true);
		path = Session.get("mailBox");
		uid = Session.get("mailMessageId");
		MailAttachment.mailCodeDownload path, uid, (dirname, name, filePath)->
			toastr.success("邮件原文已存储");
			Session.set("mailSending",false);
			MailAttachment.openFile(dirname, name);


	'click #right_back': (event)->
		backURL =  "/emailjs/b/" + Session.get("mailBox")
		FlowRouter.go(backURL)
		$(".steedos-mail").removeClass("right-show")
		Session.set("mailLoading",false)
