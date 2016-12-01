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



Template.read_mail.events
	'click .mailbox-attachment-name': (event, template)->
		console.log("----mailbox-attachment-name------");
		Session.set("donwLoadding",true)
		att_index = parseInt(event.target.dataset.index);

		path = Session.get("mailBox");

		message = MailManager.getMessage(parseInt(Session.get("mailMessageId")))

		uid = message.uid;

		att = message.attachments[att_index];

		MailAttachment.download path, uid, att.bodyPart, (dirname, name, filePath)->
			toastr.success("附件已存储");
			Session.set("donwLoadding",false)
			MailAttachment.openFile(dirname, name);


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
			Session.set("mailLoading",false);


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



Template.read_mail.onRendered ->
		$('[data-toggle="tooltip"]').tooltip()
