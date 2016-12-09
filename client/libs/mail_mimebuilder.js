MailMimeBuilder = {};

var MimeBuilder, fs, MimeCodec;

if(Steedos.isNode()){
	MimeBuilder = require('emailjs-mime-builder');
	fs = nw.require('fs');
	MimeCodec = require('emailjs-mime-codec');
}

MailMimeBuilder.getMessageMime = function(from, to, cc, bcc,subject, body, attachments, isDispositionNotification){

	var node = new MimeBuilder("multipart/mixed").addHeader({ Subject: subject}).addHeader({ From:from}).addHeader({ To:MailManager.getAddress(to)});

	if(isDispositionNotification){
		node.addHeader({"Disposition-Notification-To": from});
	}

	if(cc && cc.length > 0){
		node.addHeader({Cc: MailManager.getAddress(cc)});
	}

	if(bcc && bcc.length > 0){
		node.addHeader({Bcc: MailManager.getAddress(bcc)});
	}

	node.createChild("text/html").setContent(body);

	if(attachments){
		attachments.forEach(function(attachment){
			var attachment_data = fs.readFileSync(attachment.path);
			node.createChild(false, {filename:attachment.name}).setHeader("Content-Type","application/octet-stream").setHeader("Content-Disposition", "attachment").setHeader("Content-Transfer-Encoding", "base64").setContent(new Uint8Array(attachment_data));
		});
	}

	return node.build();

}
