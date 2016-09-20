Template.read_mail.helpers
	message: ->
		id = Session.get("mailMessageId");

		return MailManager.getMessage(id) ;

	path: ->
		return Session.get("mailBox");

	attachmentIcon: (name)->
		return MailAttachment.getAttachmentIcon(name);
		
	modifiedString: (date)->
	    modifiedString = moment(date).format('YYYY-MM-DD HH:mm');
	    return modifiedString;

	showLoadding: ->
		return Session.get("mailMessageLoadding");

	mailBody: (message)->
		if message.bodyHtml.data
			data = message.bodyHtml.data;

			return MailManager.resetHrefs(data);
			# return message.bodyHtml.data;
		else
			return message.bodyText.data;

	fromName: (from)->
        if(from && from.length > 0)
            return if from[0].name then from[0].name else from[0].address

	fileSize: (size)->
		rev = size / 1024.00;
		unit = 'KB';

		if rev > 1024.00
			rev = rev / 1024.00;
			unit = 'MB';

		if rev > 1024.00
			rev = rev / 1024.00;
			unit = 'GB';

		return rev.toFixed(2) + unit;

Template.read_mail.events
	'click .mailbox-attachment-name': (event, template)->
		att_index = parseInt(event.target.dataset.index);

		path = Session.get("mailBox");

		message = MailManager.getMessage(Session.get("mailMessageId"))

		uid = message.uid;

		att = message.attachments[att_index];

		MailAttachment.download path, uid, att.bodyPart, (dirname, name, filePath)->
			toastr.success("附件已存储");
			MailAttachment.openFile(dirname, name);

	'click .last_mail': (event, template)->
		console.log("click last_mail")
		MailManager.getLastMessage();

	'click .next_mail': (event, template)->
		console.log("click next_mail");
		MailManager.getNextMessage();
		
	'click .mail-delete': (event, template)->
		console.log("click mail-delete");
		path = Session.get("mailBox");

		message = MailManager.getMessage(Session.get("mailMessageId"))

		uid = message.uid;
	
		if path == 'Trash'
			MailManager.completeDeleteMessages path, uid, ()->	
		else
			MailManager.deleteMessages path, uid, ()->
				

Template.read_mail.onRendered ->
	$(window).on 'keydown', (event)->
		if event.which == 37
			MailManager.getLastMessage();
		else if event.which == 39
			MailManager.getNextMessage();
 		console.log(event.which);
   