MailMimeBuilder = {};

var MimeBuilder, fs;

if(Steedos.isNode()){
	MimeBuilder = require('emailjs-mime-builder');
	fs = nw.require('fs');
}

MailMimeBuilder.getMessageMime = function(from, to, cc, bcc,subject, body, attachments){

	var node = new MimeBuilder("multipart/mixed").addHeader({ Subject: subject}).addHeader({ From:from}).addHeader({ To:to});

	if(cc && cc.length > 0){
    	node.addHeader({ Cc: cc});
    }

    if(bcc && bcc.length > 0){
    	node.addHeader({ Bcc: bcc});
    }

	node.createChild("text/html").setContent(body);

	if(attachments){
		attachments.forEach(function(attachment){
			var attachment_data = fs.readFileSync(attachment.path);
			node.createChild(false, {}).setHeader("Content-Type","application/octet-stream").setHeader("Content-Disposition", "attachment; filename=" + attachment.name).setHeader("Content-Transfer-Encoding", "base64").setContent(new Uint8Array(attachment_data));
		});
	}

	return node.build();

}
