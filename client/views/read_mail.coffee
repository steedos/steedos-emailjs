Template.read_mail.helpers
	message: ->
		if Session.get("mailInit")
			uid = Session.get("mailMessageId");

			return MailManager.getMessage(parseInt(uid)) ;

	path: ->
		return Session.get("mailBox");

	attachmentIcon: (name)->
		return MailAttachment.getAttachmentIcon(name);

	attachmentType: (attachment)->
		# if attachment.bodyPart?.type?.indexOf("image/") == 0
		# 	return false
		# else
		return true

	modifiedString: (date)->
		modifiedString = moment(date).format('YYYY年MM月DD日 HH:mm');
		return modifiedString;

	showLoadding: ->
		return Session.get("mailMessageLoadding");

	mailBody: (message)->
		if !message || message.uid == undefined
			return '';

		if message.bodyHtml?.data
			data = message.bodyHtml.data;
			MailAttachment.handerInline(Session.get("mailBox"), message)
			return MailManager.resetHrefs(data);
		else
			return message.bodyText.data;

	fileSize: (size)->
		return MailAttachment.formatFileSize size;

	equals: (a,b) ->
		return (a == b)

	isDispositionNotificationAlertNeeded: () ->
		return Session.get("isDispositionNotificationAlertNeeded")


Template.read_mail.events
	'click .mailbox-attachment-name': (event, template)->
		$(document.body).addClass('loading');

		att_index = parseInt(event.target.dataset.index);

		mailBox = Session.get("mailBox");

		message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))

		uid = message.uid;

		att = message.attachments[att_index];

		emailFolder = MailAttachment.downloadPath();

		# 判断本地是否已缓存附件
		if MailAttachment.fileExists(emailFolder, att.name)
			$(document.body).removeClass('loading');
			MailAttachment.openFile(emailFolder, att.name);

		else
			toastr.info("下载中，请稍后...");
			
			MailAttachment.download mailBox, uid, att.bodyPart, false, emailFolder, (emailFolder, name, filePath)->
				# toastr.success("附件已打开");
				$(document.body).removeClass('loading');
				MailAttachment.openFile(emailFolder, name);

	
	'click .mailbox-attachment-saveAs': (event, template)->
		$(document.body).addClass('loading');
		toastr.info("下载中，请稍后...");
		att_index = parseInt(event.target.dataset.index);

		mailBox = Session.get("mailBox");

		message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))

		uid = message.uid;

		att = message.attachments[att_index];

		emailFolder = MailAttachment.downloadPath();

		MailAttachment.download mailBox, uid, att.bodyPart, true, emailFolder, (emailFolder, name, filePath)->
			toastr.success("请选择存储目录");
			$(document.body).removeClass('loading');

	
	'click .mail-address-serach': (event, template)->
		console.log("click .mail-address");
		Session.set("mailLoading",true);

		path = Session.get("mailBox");
		FlowRouter.go("/emailjs/b/search/" + path);
		$(".steedos-mail").removeClass("right-show")

		currentAddress = this.address
		Session.set("mailSearchAddress", currentAddress);

		MailManager.search currentAddress, (result) ->
			if !result || result.length == 0
				toastr.info("未搜索到数据");
			else
				Session.set("mailPage",1);
				Session.set("mailBoxFilter", result);
				toastr.info("搜索完成");
			Session.set("mailLoading",false);

			$(".products-list").scrollTop(0);


	'click .next_mail': (event, template)->
		console.log("click next_mail");
		MailManager.getNextMessage();

	'click .mail-address-add-to-books': (event, template)->
		owner = Meteor.userId()
		email = this.address
		name = this.name

		Meteor.call('add_to_books', owner, email, name, (error, result) ->
			if error
				if error.error
					toastr.error TAPi18n.__ error.reason
				else
					toastr.error error.message

			if result
				AdminDashboard.modalNew 'address_books', { name: name, email: email}

		)


	'click .mail-address-compose': (event, template)->
		Session.set("mailAddress", this)

	'click .alert-disposition-notification .btn-ok': (event, template)->
		uid = Session.get("mailMessageId");
		message = MailManager.getMessage(parseInt(uid));
		dnt = message.dispositionNotificationTo
		subject = if message.subject then message.subject else t "mail_subject_empty"
		# newSubject = "对方已阅读：#{subject}"
		newSubject = t "mail_alert_disposition_notification_subject",subject
		auth = AccountManager.getAuth()
		# newBody = "对方已经阅读您在#{moment(message.date).format('YYYY-MM-DD HH:mm')}发给 #{Meteor.user().username} &lt;#{auth.user}&gt;，主题为#{subject}的邮件。"
		newBody = t "mail_alert_disposition_notification_body", moment(message.date).format('YYYY-MM-DD HH:mm'), Meteor.user().name, auth.user, subject

		SmtpClientManager.sendMail [dnt], [], [], newSubject, newBody, [], false, ->
			Session.set("isDispositionNotificationAlertNeeded",false)

	'click .alert-disposition-notification .btn-cancel': (event, template)->
		Session.set("isDispositionNotificationAlertNeeded",false)




Template.read_mail.onRendered ->
		$('[data-toggle="tooltip"]').tooltip()
