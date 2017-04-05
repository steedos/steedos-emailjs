Template.mail_compose.helpers

	isReady: (uid)->
		if Session.get("mailMessageId") == "compose"
			return true;
		else
			if uid >= 0
				return true;
		return false;

	message: ->
		if Session.get("mailInit") && Session.get("mailBoxInit")
			return MailManager.getMessage(parseInt(Session.get("mailMessageId")));

	mail_to: (to,from) ->
		if Session.get("mailInit") && Session.get("mailBoxInit")
			console.log("mail_compose：mail_to run... ");
			rev = {name: "mail_to", title: '收件人', atts:{id: "mail_to", name: "mail_to"}};

			if Session.get("mailAddress")
				rev.values =  [Session.get("mailAddress")];
			else if Session.get("mailJumpDraft")
				rev.values =  to;
			else if Session.get("mailReply")
				rev.values =  from;
			else if Session.get("mailReplyAll")
				toAll = from.concat(to);

				fromUserAddress = toAll.filterProperty("address", AccountManager.getAuth().user);

				fromUserAddress.forEach (address)->
					toAll.remove(toAll.indexOf(address));

				# if fromUserAddress.length > 0
				#   toAll = toAll.concat(to);

				rev.values = toAll;

			return rev;

	mail_cc: (cc)->
		if Session.get("mailInit") && Session.get("mailBoxInit")
			Session.get("mailMessageId")

			rev = {name: "mail_cc", title: '抄&emsp;送', atts:{id: "mail_cc", name: "mail_cc"}};
			if Session.get("mailJumpDraft") || Session.get("mailReplyAll")
				rev.values  = cc;

			return rev;

	mail_bcc:(bcc)->
		if Session.get("mailInit") && Session.get("mailBoxInit")
			return rev = {name: "mail_bcc", title: '密&emsp;送', atts:{id: "mail_bcc", name: "mail_bcc"}};

	mail_subject: (subject) ->
		if Session.get("mailInit") && Session.get("mailBoxInit")
			if Session.get("mailJumpDraft")
				return subject;
			else if Session.get("mailForward")
				if subject
					return "转发: " + subject;
				else
					return "转发: "
			else if Session.get("mailReply") || Session.get("mailReplyAll")
				if subject
					return "回复: " + subject;
				else
					return "回复: "

	showLoadding: ->
		return Session.get("mailMessageLoadding");

	isSending: ->
		if Session.get("mailSending")
			$("#mail_sending").show();
		else
			$("#mail_sending").hide();
		return Session.get("mailSending");

	attachmentLoadding: ->
		if Session.get("donwLoadding")
			$("#attachment_donwLoadding").show();
		else
			$("#attachment_donwLoadding").hide();
		return Session.get("donwLoadding");

	messageBody: ->
		if !Session.get("mailMessageLoadding") && Session.get("mailInit") && Session.get("mailBoxInit")

			message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))
			body = "";
			if message.uid
				if Session.get("mailJumpDraft")
					body =  message.bodyHtml.data;
				else
					body =  MailForward.getBody(message);

			$("#compose-textarea").html(MailManager.resetHrefs(body));

			$("#compose-textarea").summernote
				lang: "zh-CN"
				dialogsInBody: true
		else
			$("#compose-textarea").html("加载中...");

Template.mail_compose.events
	'change #attachment_file': (event, template) ->
		console.log('add attachment_file');
		if !$("#attachment_file").val()
			return ;

		if !MailAttachment.check($("#attachment_file").val())
			toastr.error("附件: " + $("#attachment_file").val() + ", 上传失败！不允许上传此类型附件");
			$("#attachment_file").val('')
			return ;
		if event.target.files[0].size > 104857600
			toastr.error("附件超过100MB限制");
			console.log "附件" + $("#attachment_file").val() + "超过100MB限制";
			return ;

		node = MailAttachment.getAttachmentNode($("#attachment_file").val(), event.target.files[0].size);
		$("#compose_attachment_list").append(node);

		attchmentName = MailAttachment.getAttachmentName($("#attachment_file").val());
		subject = $(".subject").val();
		if subject == "" || subject == undefined || subject == null
			$(".subject").val(attchmentName);

		$("#attachment_file").val('')

	'click .mailbox-attachment-delete': (event)->
		console.log("click .mailbox-attachment-delete is run...")
		event.target.parentNode.parentNode.parentNode.parentNode.remove();


Template.mail_compose.onRendered ->
	console.log("mail_compose.onRendered run... ");
	$('[data-toggle="tooltip"]').tooltip()
	if Session.get("mailForward") || Session.get("mailJumpDraft")
		MailForward.getAttachmentsHtml();

	# setTimeout ()->
	#   # $(".subject", $(".mail-compose")).focus();

	if $("#mail_cc").val()?.length > 0
		$(".add_cc").click()

	this.autorun ()->
		if !Session.get("mailMessageLoadding") && Session.get("mailInit") && Session.get("mailBoxInit")

			message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))
			body = "";
			if message.uid
				if Session.get("mailJumpDraft")
					body =  message.bodyHtml.data;
				else
					body =  MailForward.getBody(message);

			$("#compose-textarea").html(MailManager.resetHrefs(body));

			$("#compose-textarea").summernote
				lang: "zh-CN"
				dialogsInBody: true
		else
			$("#compose-textarea").html("加载中...");
