Template.mailButton.helpers
	isComPose: ->
		return Session.get("mailMessageId") == "compose" || Session.get("mailForward") || Session.get("mailReply") || Session.get("mailReplyAll") || Session.get("mailJumpDraft") || Session.get("localhost_draft")

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
		# mail_attachment_downloaded"表示邮件转发时正在加载附件，此时不能发送邮件
		if Session.get("mail_attachment_downloaded") == false
			toastr.error("附加正在加载中....请稍等");
		else
			$(document.body).addClass('loading');
			if MailManager.getContacts("mail_to") == null || MailManager.getContacts("mail_to").length < 1
				toastr.warning("请填写收件人")
				$(document.body).removeClass('loading');
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

			LocalhostData.write("draft_data.json", {to: to, cc: cc, bcc: bcc, subject: subject, body: body, attachments: attachments})

			SmtpClientManager.beforeSendFilter(to, cc, bcc, subject, body, attachments);

			if Session.get("mailContinueSend")
				SmtpClientManager.sendMail to, cc, bcc, subject, body, attachments, isDispositionNotification, ()->

					LocalhostData.unlink("draft_data.json")
					Session.set("localhost_draft", false)

					path = Session.get("mailBox")

					if path == 'Drafts' || MailManager.getBoxBySpecialUse(path).specialUse == '\\Drafts'
						uid = Session.get("mailMessageId")
						MailCollection.getMessageCollection(path).remove({uid:parseInt(uid)});
						LocalhostDraft.delete([parseInt(uid)])
						FlowRouter.go('/emailjs/b/' + path);
						MailManager.updateBoxInfo(path);
					else
						FlowRouter.go('/emailjs/b/' + path);
						$(".steedos-mail").removeClass("right-show");

					$(document.body).removeClass('loading');
			else
				$(document.body).removeClass('loading');

	'click #compose-draft': (event)->
		# mail_attachment_downloaded"表示邮件转发时正在加载附件，此时不能发送邮件
		if Session.get("mail_attachment_downloaded") == false
			toastr.error("附加正在加载中....请稍等");
		else
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
				if Number(Session.get("mailMessageId")) < 1262304000000
					message = MailMimeBuilder.getMessageMime(AccountManager.getAuth().user , to, cc, bcc, subject, body,attachments);
					MailManager.saveDrafts(message);
				else
					MailManager.saveLocalDrafts({to: to, cc: cc, bcc: bcc, subject: subject, body: body, attachments: attachments})


	'click .mail-delete': (event, template)->
		path = Session.get("mailBox");

		message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))

		uid = message.uid;
		$(".steedos-mail").removeClass("right-show")
		MailManager.judgeDelete(path, [uid]);


	'click .mail-code-download': (event, template)->
		Session.set("mailSending",true);
		path = Session.get("mailBox");
		uid = Session.get("mailMessageId");
		MailAttachment.mailCodeDownload path, uid, true, (dirname, name, filePath)->
			toastr.success("请选择存储目录");
			Session.set("mailSending",false);


	'click #right_back': (event)->
		backURL =  "/emailjs/b/" + Session.get("mailBox")
		FlowRouter.go(backURL)
		$(".steedos-mail").removeClass("right-show")
		Session.set("mailLoading",false)
