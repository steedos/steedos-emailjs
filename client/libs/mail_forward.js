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
	var message = MailManager.getMessage(parseInt(Session.get("mailMessageId")));
	if(message.uid){

		Session.set("mail_attachment_downloaded",true);

		var m = message.attachments.length;
		if(m > 0){
			$(".message-attachments .attachments-loading").removeClass("hidden");
			$("#attachment_donwLoadding").show();
			Session.set("mail_attachment_downloaded",false);
		}

		var t=0;
		message.attachments.forEach(function(item){

			MailAttachment.download(Session.get("mailBox"), message.uid, item.bodyPart, false, function(dirname, name, filePath){

				var node = MailAttachment.getAttachmentNode(filePath, item.size);

				$("#compose_attachment_list").append(node);

				t = t + 1;

				if(t > 0 && t == m){
					$(".message-attachments .attachments-loading").addClass("hidden");
					Session.set("mail_attachment_downloaded",true);
					$("attachment_donwLoadding").hide();
				}
			});
		});
	}
}
