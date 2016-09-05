ImapClientManager = {};

var ImapClient, MimeParser, Encoding, MimeCodec, loadStep = MailPage.pageSize;

if(window.require){
	ImapClient = window.require("emailjs-imap-client");
	MimeParser  = window.require('emailjs-mime-parser');
	Encoding = window.require('emailjs-stringencoding');
	MimeCodec = require('emailjs-mime-codec')
}

ImapClientManager.getClient = function(){
	var auth = AccountManager.getAuth();
	if(!auth)
		return ;
	var domain = AccountManager.getMailDomain(auth.user);
	
	var client = new ImapClient(domain.imap, domain.imap_port,{auth:auth});
	client.logLevel = client.LOG_LEVEL_INFO;
	client._onError(function(){
		console.error("[ImapClientManager.ImapClient] error"); 
	});

	client.client.onerror(function(e){
		console.error("[ImapClientManager.ImapClient.client] error" + e);
	});

	return client;
}

ImapClientManager.mailBox = function(client, callback){
	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.listMailboxes().then(function(mailboxes){
			var children = mailboxes.children;
			children.forEach(function(box){
				console.log("mail_box insert : " + JSON.stringify(box))

				if(box.path.toLocaleLowerCase() == 'inbox'){
					box.path = "Inbox";
				}

				MailCollection.mail_box.insert(box);
			});

			client.close();
			callback();
		});
	});
}

ImapClientManager.selectMailBox = function(client, mailBox, options, callback){
	if (!client)
		client = this.getClient();

	console.log("selectMailbox name " + mailBox.name);

	client.connect().then(function(){
		client.selectMailbox(mailBox.path, options).then(function(m){
			m.box = mailBox.name;
			m.path = mailBox.path;
			console.log(mailBox.name + " selectMailbox is " + JSON.stringify(m));

			var box_info = MailManager.getBoxInfo(mailBox.path);
			if(box_info){
				MailCollection.mail_box_info.update(box_info._id, m);
			}else{
				MailCollection.mail_box_info.insert(m);
			}

			client.close();
			callback(m);
		});
	});
}


ImapClientManager.getMessageBodyByPart = function(client, path, sequence, options, bodyPart, callback){
	if (!client)
		client = this.getClient();

	var query = ['uid', 'flags'];
	
	query.push('body[' + bodyPart.part + ']');

	client.connect().then(function(){
		console.log("listMessages start, sequence is " + sequence);
		client.listMessages(path, sequence, query, options).then(function(messages){
			console.log("listMessages messages ok");
			try{
				messages.forEach(function(message){
					
					console.log("listMessages messages 开始解析：" + message.uid);

					var local_message = MailManager.getMessageByUid(path, message.uid);
					if(local_message){

						local_message.flags = messages.flags;

						local_message.summary = false;

						var bodyMime = message['body[' + bodyPart.part + ']'];
						
						if(bodyMime){

							if(bodyPart.type == 'text/plain' ){

								local_message.bodyText.data = decode(bodyMime, bodyPart);

							}else if(bodyPart.type == 'text/html'){
								
								local_message.bodyHtml.data = decode(bodyMime, bodyPart);

							}

						}

						MailCollection.getMessageCollection(path).update(local_message._id ,local_message);

					}
					
				});
			}catch(err){
				console.error(err)
			}

			client.close();
			callback(messages);
		});
	});
}


ImapClientManager.getAttachmentByPart = function(path, sequence, bodyPart, callback){
	
	var	client = this.getClient();
	
	var options = {byUid: true};

	var query = ['uid', 'flags'];
	
	query.push('body[' + bodyPart.part + ']');

	client.connect().then(function(){
		console.log("listMessages start, sequence is " + sequence);
		client.listMessages(path, sequence, query, options).then(function(messages){
			console.log("listMessages messages ok");
			try{
				messages.forEach(function(message){
					
					console.log("listMessages messages 开始解析：" + message.uid);
					console.log("[getAttachmentByPart] part.type is " + bodyPart.type);
					var bodyMime = message['body[' + bodyPart.part + ']'];
					var data = base64DecodeToUint8Array(bodyMime);
					MailAttachment.save(bodyPart.dispositionParameters.filename, data, function(filePath, fileName){
						toastr.success("附件已存储");
						MailAttachment.openFile(filePath, fileName);
					})
				});
			}catch(err){
				console.error(err)
			}

			client.close();
			callback(messages);
		});
	});
}

ImapClientManager.listMessages = function(client, path, sequence, options, callback){
	if (!client)
		client = this.getClient();

	var query = ['uid', 'flags', 'envelope','bodystructure'];

	client.connect().then(function(){
		console.log("listMessages start, sequence is " + sequence);
		client.listMessages(path, sequence, query, options).then(function(messages){
			console.log("listMessages messages ok");
			messages.forEach(function(message){
				
				console.log("listMessages messages 开始解析：" + message.uid);

				var hMessage = handerMessage(message);
				console.log("listMessages messages 解析完成：" + message.uid);
				hMessage.summary = true;
				var local_message = MailManager.getMessageByUid(path, message.uid);
				if(local_message)
					MailCollection.getMessageCollection(path).update(local_message._id ,hMessage);
				else
					MailCollection.getMessageCollection(path).insert(hMessage);
			});
			client.close();
			callback(messages);
		});
	});
}



//imap search 说明文档：https://tools.ietf.org/html/rfc3501#section-6.4.4
ImapClientManager.search = function(client, path, query, callback){
	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.search(path, query, {byUid: true}).then(function(result){
			console.log("search values is " + result);

			MailCollection.mail_search.update({},{uids:result});
			var sequence = result.toString();
			var options = {byUid: true};

			client.close();
			
			ImapClientManager.listMessages(null, path, sequence, options, function(messages){
				callback(result, messages);
			});
		});
	});
}

ImapClientManager.setFlags = function(client, path, sequence, flags, options, callback){
	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.setFlags(path, sequence, flags, options).then(function(messages){
			// console.log("[ImapClientManager.setFlags] messages：" + JSON.stringify(messages));
			client.close();
			callback(messages);
		}); 
	});
	
}

ImapClientManager.deleteMessages = function(client,path, uid,callback){

	console.log("[ImapClientManager.deleteMessages] path is " + path + "; uid is " + uid);
	if (!client)
		client = this.getClient();
	
	client.connect().then(function(){
		client.deleteMessages(path, uid, {byUid:true}).then(function(){ 
			console.log("uid values is " + uid);
			client.close();
			if(typeof(callback) == 'function'){
					callback();
			}
		})
	})
}

ImapClientManager.upload = function(client, path, message, callback){
	if (!client)
		client = this.getClient();

	console.log("ImapClientManager upload run....");
	client.connect().then(function(){
		console.log("client.upload run: path is " + path + "; message is + " + message);
		client.upload(path, message).then(function(){
			console.log("ImapClientManager upload close client.")
			client.close();
			if(typeof(callback) == 'function'){
				callback();
			}
		});
	});
}

ImapClientManager.initMailboxInfo = function(callback){
	console.log("--ImapClientManager.initMailboxInfo");
	var mail_boxs = MailCollection.mail_box.find();
	console.log("mail_box count " + mail_boxs.count());
	mail_boxs.forEach(function(mailBox){
		ImapClientManager.selectMailBox(null, mailBox, {readOnly:false}, function(m){
			ImapClientManager.updateLoadedMxistsIndex(mailBox.path, m.exists);
			if(mailBox.path.toLocaleLowerCase() === 'inbox')
				ImapClientManager.mailBoxMessages(mailBox.path);
		});
	});
	callback();
}


ImapClientManager.updateUnseenMessages = function(){
	ImapClientManager.search(null ,"Inbox", {unseen: true}, function(result){
		console.log("unseen is " + result);
		MailCollection.mail_unseen.update({},{uids:result});
	});
}

ImapClientManager.updateLoadedMxistsIndex = function(path, loadedMxistsIndex){
	MailCollection.mail_box.update({path: path},{$set: {loadedMxistsIndex: loadedMxistsIndex}})
}

function uint8ArrayToString(charset, uint8Array){
	return (new Encoding.TextDecoder(charset).decode(uint8Array));
}

function base64Decode(str){
	return MimeCodec.base64Decode(str);
}

function base64DecodeToUint8Array(str){
	return MimeCodec.base64.decode(str)
}

function quotedPrintableDecode(str, fromCharset){
	return MimeCodec.quotedPrintableDecode(str, fromCharset);
}

function decode(str, part){
	if(part.encoding == 'base64'){
		return base64Decode(str);
	}else if(part.encoding == 'quoted-printable'){
		return quotedPrintableDecode(str, part.parameters.charset);
	}else{
		return str;
	}
}

function handerBodyPart(bodyPart){
	var object = {};
	object.part = bodyPart.part;
	object.size = bodyPart.size;
	object.bodyPart = bodyPart;
	if(bodyPart.type == 'application/octet-stream'){
		object.name = bodyPart.dispositionParameters.filename;
	}else if(bodyPart.type == 'text/plain' || bodyPart.type == 'text/html') {
		object.parameters = bodyPart.parameters;
	}

	return object;
}


function handerBodystructure(messages, bodystructure){
	console.log("邮件标题：" + messages.subject  + " 附件：" + JSON.stringify(messages.attachments));
	if(!messages.attachments){
		console.log("new attachments");
		messages.attachments = new Array();
	}
	
	if(bodystructure){
		if (bodystructure.type == 'multipart/alternative' || bodystructure.type == 'multipart/mixed'){
			bodystructure.childNodes.forEach(function(bs, index){
				if(bs.type == 'application/octet-stream'){
					messages.attachments.push(handerBodyPart(bs));
				}else if(bs.type == 'text/plain'){
					messages.bodyText = handerBodyPart(bs);
				}else if(bs.type == 'text/html'){
					messages.bodyHtml = handerBodyPart(bs);
				}else{
					console.log("[handerBodystructure] bs.type is " + bs.type);
					handerBodystructure(messages, bs);
				}
			});
		}else{
			if(bodystructure.type == 'text/plain'){
				messages.bodyText = handerBodyPart(bs);
			}else if(bodystructure.type == 'text/html'){
				messages.bodyHtml = handerBodyPart(bs);
			}
		}
	}
}

function handerMessage(message){
	var rev = {};

	var envelope = message["envelope"];
	rev.uid = message.uid;
	rev.flags = message.flags;
	rev.date =envelope.date;
	rev.subject = envelope.subject;
	rev.from = envelope.from;
	rev.sender = envelope.sender;
	rev.reply_to = envelope["reply-to"];
	rev.to = envelope.to;
	rev.cc = envelope.cc;
	rev.bcc = envelope.bcc;
	rev.in_reply_to = envelope["in-reply-to"];
	rev.message_id  = envelope["message-id"];

	rev.bodystructure = message["bodystructure"];

	// rev.attachments = new Array(), bodyText = "", bodyHtml = "";
	try{
		handerBodystructure(rev, rev.bodystructure);
	}catch(err){
		console.log(err);
	}
	console.log("handerBodystructure ok");

	// if(rev.bodystructure){
	// 	var node
	// 	if(rev.bodystructure.type == 'multipart/alternative' || rev.bodystructure.type == 'multipart/mixed'){
	// 		rev.bodystructure.childNodes.forEach(function(bs, index){
	// 			if(parser){
	// 				node = parser.nodes["node"+(index+1)];
	// 			}

	// 			if(bs.disposition == 'attachment'){
	// 				var attachment = new Object();
	// 				attachment.name = bs.dispositionParameters.filename;
	// 				if(node){
	// 					// attachment.data_buffer = new Buffer(node.content);
	// 					// attachment.data_array = Array.from(node.content);
	// 					//console.log(attachment.data_buffer);
	// 					attachment.data = Array.from(node.content) //uint8ArrayToString(node.charset,node.content);
	// 				}
	// 				attachments.push(attachment);
	// 			}else{
	// 	    		if(bs.type == 'multipart/alternative'){
	// 	    			if(node){
	// 		    			bodyText = uint8ArrayToString(node._childNodes[0].charset,node._childNodes[0].content);
	// 		    			bodyHtml = uint8ArrayToString(node._childNodes[1].charset,node._childNodes[1].content);
	// 		    		}

	// 	    		}else if(bs.type == 'text/plain'){
	// 	    			if(node){
	// 	    				bodyText = uint8ArrayToString(node.charset,node.content);
	// 	    			}

	// 	    		}else if(bs.type == 'text/html'){
	// 	    			if(node){
	// 		    			bodyHtml = uint8ArrayToString(node.charset,node.content);
	// 		    		}

	// 	    		}
	// 			}
	// 		});
	// 	}else{
	// 		if(parser){
	//     		node = parser.node;
	//     	}
 //    		if(node){
	//     		if(rev.bodystructure.type == 'text/plain'){

	//     			bodyText = uint8ArrayToString(node.charset,node.content);
	//     		}else if(rev.bodystructure.type == 'text/html'){

	//     			bodyHtml = uint8ArrayToString(node.charset,node.content);
	//     		}
 //    		}
 //    	}

	// }

	// rev.bodyText = bodyText;
	// rev.bodyHtml = bodyHtml;
	// rev.attachments = attachments;

	return rev;
}

ImapClientManager.mailBoxMessages = function(path, callback){

	var box = MailManager.getBox(path);

	if(!box)
		return ;

	var loadedMxistsIndex = box.loadedMxistsIndex;

	if (loadedMxistsIndex < 1){
		if(typeof(callback) == "function"){
			callback();	
		}
		return ;
	}
	
	var sequence_s = loadedMxistsIndex <= 10 ? 1 : (loadedMxistsIndex - 10 + 1);

	var sequence = sequence_s + ":" + loadedMxistsIndex;

	var options = {};

	console.info("listMessages path[" + path + '] sequence[' + sequence + ']');

	ImapClientManager.listMessages(null, path, sequence, options, function(messages){
		ImapClientManager.updateLoadedMxistsIndex(path, sequence_s - 1);
		if(typeof(callback) == "function"){
			callback();	
		}
	});
}

ImapClientManager.getNewMessage = function(path, callback){
	var box = MailManager.getBox(path);

	if(!box)
		return ;

	if(box.info){
		var sequence = box.info.uidNext + ":*";
		var options = {byUid: true};
		ImapClientManager.listMessages(null, path, sequence, options, callback);
	}
}

ImapClientManager.getMessageByUid = function(path, sequence, bodyPart, callback){
	var options = {byUid: true};
	
	try{
		ImapClientManager.getMessageBodyByPart(null, path, sequence, options, bodyPart, callback);	
	}catch(err){
		console.log(err);
	}
}

ImapClientManager.getAttachment = function(path , sequence, bodyPart, callback){
	var options = {byUid: true};
	
	try{
		ImapClientManager.getMessageBodyByPart(null, path, sequence, options, bodyPart, callback);	
	}catch(err){
		console.log(err);
	}
}

ImapClientManager.updateSeenMessage = function(path, uid, callback){

	console.log("[ImapClientManager.updateSeenMessage] path is " + path + "; uid is " + uid);
	var message = MailManager.getMessageByUid(path, uid);

	ImapClientManager.setFlags(null, path, uid, {set: ['\\Seen']}, {byUid:true}, function(messages){
		messages.forEach(function(m){
			console.log(m);
			MailCollection.getMessageCollection(path).update(message._id, {$set:{flags: m.flags}});
		})
		callback();
	})
	
}




