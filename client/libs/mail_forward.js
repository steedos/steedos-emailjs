MailForward = {};


function getAddressHtml(address){
	var adds = new Array();

	address.forEach(function(item){
		adds.push(item.name + "&lt;" + item.address + "&gt;")
	});

	return adds;
}

MailForward.getBody = function(message){

	var html = "<br>"

  html += "<div style='margin-left: 30px'>"

	html += "----------------------------------------------<br>"

  html += "发件人: &nbsp;" + getAddressHtml(message.from) + "<br>"

	html += "发送时间: &nbsp;"+ moment(message.date).format('YYYY-MM-DD HH:mm') + "<br>"

	html += "收件人: &nbsp;" + getAddressHtml(message.to) + "<br>"

	html += "主 &nbsp;&nbsp; 题: &nbsp;"+ message.subject + "<br>"

	html += "<br>"

	if(message.bodyHtml){
		html += message.bodyHtml.data
	}else if(message.bodyText){
		html += message.bodyText.data
	}
	

	html += "</div><br>"

	return html;
}

MailForward.getAttachmentsHtml = function(){
	console.log("[MailForward.getAttachmentsHtml]");
	var message = MailManager.getMessage(parseInt(Session.get("mailMessageId")));
	if(message.uid){
		message.attachments.forEach(function(item){
			//$("#mail_attachment").show();
			MailAttachment.download(Session.get("mailBox"), message.uid, item.bodyPart, function(dirname, name, filePath){

				var node = MailAttachment.getAttachmentNode(filePath, item.size);
				console.log("name : "+ name + " ; dirname : " + dirname +" ; filePath : " + filePath);
				// console.log(node)
	    		$("#compose_attachment_list").append(node);
	    		//$("#mail_attachment").hide();
			});
		});
	}
}
