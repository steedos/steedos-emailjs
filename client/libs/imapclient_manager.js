ImapClientManager = {};

/**
 * 40: ERROR
 * 20: INFO
 * 10: DEBUG
 * 0: ALL
 * @type {number}
 */
ImapClientManager.LOG_LEVEL = 20

ImapClientManager._clientConnectOnError = function(error){
	console.log('[ImapClientManager._clientConnectOnError]:', error);
	ImapClientManager.isNotClient();
};


var ImapClient, MimeParser, Encoding, MimeCodec, loadStep = MailPage.pageSize;

if(Steedos.isNode()){
	regeneratorRuntime = require('regenerator-runtime');
	ImapClient = require("emailjs-imap-client");
	MimeParser  = require('emailjs-mime-parser');
	Encoding = require('emailjs-stringencoding');
	MimeCodec = require('emailjs-mime-codec');
}

ImapClientManager.getClient = function(auth){
	if(!auth)
		auth = AccountManager.getAuth();
	if(!auth)
		return ;
	var domain = AccountManager.getMailDomain(auth.user);

	var options = {auth:auth};

	if (Meteor.settings.public && Meteor.settings.public.webservices && Meteor.settings.public.webservices.wsproxy)
	{
		options.ws = {
			url: Meteor.settings.public.webservices.wsproxy.url,
			options: {
				upgrade: false // disable ws protocol
			}
		}
		options.tlsWorkerPath = "/packages/steedos_emailjs/client/assets/emailjs-tcp-socket-tls-worker.js"
	}


	if (!domain.imap_ssl){
		options.useSecureTransport = false;
		options.ignoreTLS = true;
	}

	var client = new ImapClient(domain.imap_server, domain.imap_port, options);

	client.logLevel = ImapClientManager.LOG_LEVEL;

	client._onError(function(){
		console.error("[ImapClientManager.ImapClient] error");
	});

	client.client.onerror(function(e){
		console.error("[ImapClientManager.ImapClient.client] error" + e);
	});

	return client;
}

//获取所有Box信息
ImapClientManager.mailBox = function(client, callback){
	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.listMailboxes().then(function(mailboxes){
			var children = mailboxes.children;
			children.forEach(function(box){

				if(box.path.toLocaleLowerCase() == 'inbox'){
					box.path = "Inbox";
				}
				var dbBox = MailManager.getBox(box.path);
				if(dbBox){
					MailCollection.mail_box.update(dbBox._id, box);
				}else{
					MailCollection.mail_box.insert(box);
				}

			});

			client.close();
			callback();
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.selectMailBox = function(client, mailBox, options, callback){
	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.selectMailbox(mailBox.path, options).then(function(m){
			m.box = mailBox.name;
			m.path = mailBox.path;

			var box_info = MailManager.getBoxInfo(mailBox.path);
			if(box_info){
				MailCollection.mail_box_info.update(box_info._id, m);
			}else{
				MailCollection.mail_box_info.insert(m);
			}

			client.close();
			callback(m);
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.getBodystructure = function(client, path, sequence, callback){
	if (!client)
		client = this.getClient();

	var query = ['uid', 'flags', 'envelope', 'bodystructure'];
	client.connect().then(function(){
		client.listMessages(path, sequence, query, {byUid: true}).then(function(messages){
			try{
				messages.forEach(function(message){

					if(message && message.uid){

						var hMessage = handerMessage(message);
						if(!hMessage.bodyHtml && !hMessage.bodyText){

							hMessage.summary = false;
							hMessage.bodyText = {};
							hMessage.bodyText.data="";

						}else{
							hMessage.summary = true;
						}

						console.log("hMessage", hMessage)

						var local_message = MailManager.getMessageByUid(path, message.uid);
						if(local_message){
							MailCollection.getMessageCollection(path).update(local_message._id ,hMessage);
						}else
							MailCollection.getMessageCollection(path).insert(hMessage);

						callback(path, hMessage);
					}

				});

				if(messages.length < 1){
					callback(path, null);
				}

			}catch(err){
				console.error(err)
			}

			client.close();

		}).catch(function (reason) {
			console.error( 'IMAP getBodystructure function called: ', reason );
			toastr.error("邮件内容查看失败，请登录中油WEB邮箱地址查看")
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}


ImapClientManager.getMessageBodyByPart = function(client, path, sequence, options, bodyPart, callback){
	if (!client)
		client = this.getClient();

	var query = ['uid', 'flags'];

	query.push('body[' + bodyPart.part + ']');
	query.push('body[header.fields (Disposition-Notification-To)]');

	client.connect().then(function(){
		client.listMessages(path, sequence, query, options).then(function(messages){
			try{
				messages.forEach(function(message){

					var local_message = MailManager.getMessageByUid(path, message.uid);
					if(local_message){

						local_message.flags = message.flags;

						local_message.summary = false;

						var bodyMime = message['body[' + bodyPart.part + ']'];

						if(bodyMime){

							if(bodyPart.type == 'text/plain' ){

								local_message.bodyText.data = decode(bodyMime, bodyPart);

							}else if(bodyPart.type == 'text/html'){

								local_message.bodyHtml.data = decode(bodyMime, bodyPart);

							}

						}

						setDntHeader(message, local_message);
						MailCollection.getMessageCollection(path).update(local_message._id ,local_message);

					}

				});
			}catch(err){
				console.error(err)
			}

			client.close();
			callback(messages);
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.getMailCode = function(path, uid, callback){
	var	client = this.getClient();

	var options = {byUid: true};

	var query = ["RFC822"];

	client.connect().then(function(){
		client.listMessages(path, uid, query, options).then(function(message){

			var m = MailManager.getMessage(parseInt(uid));
			var name = m.subject;
			var filename;

			if(name == "" || name == null || name == undefined){
				filename = "[无主题].eml";
			}else{
				filename = name.replace(/[\\/:*?\"<>|]/g, "-") + ".eml";
			}

			var code = message[0].rfc822;
			callback(filename, code);
			client.close();
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.getAttachmentByPart = function(path, sequence, bodyPart, callback){

	var	client = this.getClient();

	var options = {byUid: true};

	var query = ['uid', 'flags'];

	query.push('body[' + bodyPart.part + ']');

	client.connect().then(function(){
		client.listMessages(path, sequence, query, options).then(function(messages){
			try{
				messages.forEach(function(message){
					var bodyMime = message['body[' + bodyPart.part + ']'];
					var data = "";
					var filename = "";
					if(bodyPart.type == 'message/delivery-status'){
						filename = 'message' + bodyPart.part + ".delivery-status";
						data = bodyMime;
					}else if(bodyPart.type == 'message/rfc822'){
						filename = 'message' + bodyPart.part + ".eml";
						data = bodyMime;
					}else if(bodyPart.type.indexOf("image/") > -1){
						filename = "image.jpg";
						data = ImapClientManager.decodeToUint8Array(bodyMime, bodyPart);
					}else{
						filename = bodyPart.dispositionParameters.filename;
						data = ImapClientManager.decodeToUint8Array(bodyMime, bodyPart);
					}
					callback(filename, data);
				});
			}catch(err){
				console.error(err)
			}
			client.close();
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.isNotClient = function(){
	if (!Meteor.userId())
		return false;
	if (Meteor.loggingIn())
		return false;
	
	// 判断当前状态是否为系统操作 0：无操作  1：系统
	if (MailState.value != 1)
		ImapClientManager.reconnectInfo();

	// 重连前clearTimeout
	Meteor.clearTimeout(ImapClientManager.reload_timeoutId);
	
	// 自动重连
	ImapClientManager.reload_timeoutId = Meteor.setTimeout(function () {
		toastr.info("邮件服务器断开，正在尝试重连...");
		MailManager.initMail();
		sweetAlert.close();
	}, 5 * 60 * 1000)
}

ImapClientManager.reconnectInfo = function(){
	swal({
		title: t("mail_server_interrupte"),
		text: t("emailjs_mail_refresh"),
		type: "warning",
		showCancelButton: true,
		cancelButtonText: t("emailjs_mail_cancel"),
		confirmButtonText: t("mail_refresh"),
		closeOnConfirm: false
	},function(reason){

		Meteor.clearTimeout(ImapClientManager.reload_timeoutId);

		if (reason == false){
			//return ;
			$('body').removeClass("loading");
			// Modal.show("app_list_box_modal");
		} else{
			window.location.reload();
			sweetAlert.close();
		}
	})
}

ImapClientManager.listMessages = function(client, path, sequence, options, callback, init){
	if (!client)
		client = this.getClient();
	// if (!client)
	// 	alert("error!");
	// 	//callback();
	// 	return;

	var query = ['uid', 'flags', 'envelope'];

	if(init){
		var box = MailManager.getBoxInfo(path);
		if(box.uidNext){
			var _ms = LocalhostBox.read(path, box.uidNext.toString());
			if(_ms){
				console.log('从本地文件中加载数据.........');
				_ms.forEach(function(hMessage){
					if(hMessage && hMessage.uid){
						if(!hMessage.bodyHtml && !hMessage.bodyText){
							hMessage.summary = true;
							hMessage.bodyText = {};
							hMessage.bodyText.data="";

						}else{
							hMessage.summary = true;
						}
						var local_message = MailManager.getMessageByUid(path, hMessage.uid);
						if(!local_message){
							MailCollection.getMessageCollection(path).insert(hMessage);
						}
					}
				});

				if (client){
					client.connect().then(function(){
						console.log('检测本地数据准确性 从远程服务器下载数据....', path, sequence, ['uid'], options);
						client.listMessages(path, sequence, ['uid'], options).then(function(messages){
							// console.log('get uid ------> messages', messages)
							if(messages && _.isArray(messages)){
								uidTop20 = messages.getProperty("uid")
								localUid = MailCollection.getMessageCollection(path).find({}, {fields: {uid: 1},sort:{uid: 1}}).fetch().getProperty("uid")
								diffUid = _.difference(uidTop20, localUid)
								// console.log('uidTop20', uidTop20)
								// console.log('localUid', localUid)
								console.log('diffUid', diffUid)
								if(diffUid.length > 0 ){
									console.log('load diffUid', diffUid)
									ImapClientManager.listMessages(null, path, diffUid, {byUid: true}, function (_ms) {
										LocalhostBox.write("Inbox", true)
									});
								}
							}
							client.close();
							callback(_ms);
						},function(err){
							if (err)
								ImapClientManager.isNotClient();
						});
					},function(err){
						if (err)
							ImapClientManager.isNotClient();
					}).catch(function (err) {
						ImapClientManager._clientConnectOnError(err)
					});
				} else{
					ImapClientManager.isNotClient();
				}
				return
			}
		}
	}

	if (client){
		client.connect().then(function(){
			console.log('从远程服务器下载数据....');
			client.listMessages(path, sequence, query, options).then(function(messages){
				console.log('messages.length', messages.length)
				messages.forEach(function(message){
					if(message && message.uid){
						var hMessage = handerMessage(message);
						if(!hMessage.bodyHtml && !hMessage.bodyText){

							hMessage.summary = true;
							hMessage.bodyText = {};
							hMessage.bodyText.data="";

						}else{
							hMessage.summary = true;
						}
						var local_message = MailManager.getMessageByUid(path, message.uid);
						if(local_message){
							// MailCollection.getMessageCollection(path).update(local_message._id ,hMessage);
						}else{
							MailCollection.getMessageCollection(path).insert(hMessage);
						}
					}
				});
				client.close();
				callback(messages);
			},function(err){
				if (err)
					ImapClientManager.isNotClient();
			});
		},function(err){
			if (err)
				ImapClientManager.isNotClient();
		}).catch(function (err) {
			ImapClientManager._clientConnectOnError(err)
		});
	} else{
		ImapClientManager.isNotClient();
	}
}

ImapClientManager.listSearchMessages = function(client, path, sequence, options, callback){
	if (!client)
		client = this.getClient();

	var query = ['uid', 'flags', 'envelope'];

	client.connect().then(function(){
		client.listMessages(path, sequence, query, options).then(function(messages){

			messages.forEach(function(message){
				if(message && message.uid){

					var hMessage = handerMessage(message);
					if(!hMessage.bodyHtml && !hMessage.bodyText){

						hMessage.summary = true;
						hMessage.bodyText = {};
						hMessage.bodyText.data="";

					}else{
						hMessage.summary = true;
					}
					var local_message = MailManager.getMessageByUid(path, message.uid);
					if(local_message){
						// MailCollection.searchMessageCollection(path).update(local_message._id ,hMessage);
					}else
						MailCollection.searchMessageCollection(path).insert(hMessage);
				}
			});

			client.close();
			callback(messages);
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.searchUnseenMessages = function(client, path, query, callback){

	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.search(path, query, {byUid: true}).then(function(result){
			if(!result || result.length == 0){

				callback(result, []);
				return;
			}
			client.close();
			callback(result);
		})
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}


ImapClientManager.search = function(client, path, query, callback){

	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.search(path, query, {byUid: true}).then(function(result){
			if(!result || result.length == 0){

				callback(result, []);
				return;
			}

			MailCollection.mail_search.update({},{uids:result.reverse()});

			client.close();

			callback(result);

		}, function(reject){
			callback([]);
			toastr.error("您的邮箱不支持搜索功能");
			console.error("[ImapClientManager.search] Error: " +  reject);
		})
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.setFlags = function(client, path, sequence, flags, options, callback){
	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.setFlags(path, sequence, flags, options).then(function(messages){
			client.close();
			callback(messages);
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});

}

ImapClientManager.moveMessages = function(client, fromPath, toPath, uids, callback){
	if (!client)
		client = this.getClient();
	client.connect().then(function(){
		client.moveMessages(fromPath, uids, toPath, {byUid:true}).then(function(){
			client.close();

			MailCollection.getMessageCollection(fromPath).remove({uid:{$in: uids}});

			if(typeof(callback) == 'function'){
				callback();
			}
		})
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.deleteMessages = function(client, path, uids,callback){
	var trash = MailManager.getBoxBySpecialUse("\\Trash").path;
	ImapClientManager.moveMessages(client, path, trash, uids, callback);
}

ImapClientManager.completeDeleteMessages = function(client, path, uids, callback){

	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.deleteMessages(path, uids, {byUid:true}).then(function(){
			client.close();

		MailCollection.getMessageCollection(path).remove({uid:{$in: uids}});
			if(typeof(callback) == 'function'){
				callback();
			}
		})
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}

ImapClientManager.upload = function(client, path, message, callback){
	if (!client)
		client = this.getClient();

	client.connect().then(function(){
		client.upload(path, message).then(function(){
			client.close();
			if(typeof(callback) == 'function'){
				callback();
			}
		});
	}, ImapClientManager._clientConnectOnError).catch(function (err) {
		ImapClientManager._clientConnectOnError(err)
	});
}


/*
* 如果当前box的info 数据不存在；
* 则收取info信息并获取box下的最新数据，条数根据分页数据计算;
*/
ImapClientManager.initMailboxInfo = function(mailBox, callback, init){

	if(!mailBox)
		return;

	var box_info = MailManager.getBoxInfo(mailBox.path);

	if(box_info){

		if(typeof(callback) == "function"){
			callback();
		}

		return ;
	}


	Session.set("mailBoxInit", false);

	ImapClientManager.selectMailBox(null, mailBox, {readOnly:false}, function(m){
		ImapClientManager.updateLoadedMxistsIndex(mailBox.path, m.exists);
		if(mailBox.path.toLocaleLowerCase() === 'inbox')
			ImapClientManager.mailBoxMessages(mailBox.path, callback, init);
	});

}

ImapClientManager.updateUnseenMessages = function(callback){
	ImapClientManager.searchUnseenMessages(null ,"Inbox", {unseen: true}, function(result){
		MailCollection.mail_unseen.update({},{uids:result});
		if(typeof(callback) == "function"){
			callback();
		}
	});
}

ImapClientManager.updateLoadedMxistsIndex = function(path, loadedMxistsIndex){
	MailCollection.mail_box.update({path: path},{$set: {loadedMxistsIndex: loadedMxistsIndex}})
}

function uint8ArrayToString(charset, uint8Array){
	return (new Encoding.TextDecoder(charset).decode(uint8Array));
}

function base64Decode(str, fromCharset){
	return MimeCodec.base64Decode(str, fromCharset);
}

ImapClientManager.base64DecodeToUint8Array = function(str){
	return MimeCodec.base64.decode(str)
}

ImapClientManager.decodeToUint8Array = function(str, bodyPart){
	if(bodyPart.encoding == 'base64'){
		//MimeCodec.base64Decode 函数如果没有传入第二个参数, 会默认为 'buffer' 导致文件乱码, 因此直接使用MimeCodec.base64.decode函数
		return MimeCodec.base64.decode(str);
	}
	return decode(str, bodyPart)
}

function quotedPrintableDecode(str, fromCharset){
	return MimeCodec.quotedPrintableDecode(str, fromCharset);
}

function decode(str, part){
	if(part.encoding == 'base64'){
		return base64Decode(str, part.parameters.charset);
	}else if(part.encoding == 'quoted-printable'){
		return quotedPrintableDecode(str, part.parameters.charset);
	}else if(part.encoding == '8bit'){
		var url = $("a",$(str)).attr("href");
		var decodedStr = quotedPrintableDecode(str, part.parameters.charset);
		var curl = $("a",$(decodedStr)).attr("href");
		decodedStr = decodedStr.replace(curl, url);
		return decodedStr;
	}else {
		return str;
	}
}

function mimeWordDecode(str){
	if(!str)
		return '';
	return MimeCodec.mimeWordDecode(str)
}

function handerBodyPart(bodyPart){
	var object = {};
	if(bodyPart.part == undefined){
		bodyPart.part = 1;
	}
	object.part = bodyPart.part;
	object.size = bodyPart.size;
	object.bodyPart = bodyPart;
	if(bodyPart.type == 'text/plain' || bodyPart.type == 'text/html') {
		object.parameters = bodyPart.parameters;
	}else{
		if(bodyPart.type == 'message/delivery-status'){
			object.name = 'message' + bodyPart.part + ".delivery-status";
		}else if(bodyPart.type == 'message/rfc822'){
			object.name = 'message' + bodyPart.part + ".eml";
		}else{
			// if(bodyPart.type == 'application/octet-stream'){
			if(bodyPart.dispositionParameters){
				object.name = bodyPart.dispositionParameters.filename;
			}
			// }
		}
	}

	return object;
}


ImapClientManager.handerBodystructure = function(messages, bodystructure){
	if(!messages.attachments){
		messages.attachments = new Array();
	}

	if(bodystructure){

		if(bodystructure.type == 'text/plain'){
			messages.bodyText = handerBodyPart(bodystructure);
		}else if(bodystructure.type == 'text/html'){
			messages.bodyHtml = handerBodyPart(bodystructure);
		}else{
			// if (bodystructure.type == 'multipart/alternative' || bodystructure.type == 'multipart/mixed' || bodystructure.type == 'multipart/related' || bodystructure.type == 'multipart/report'){
			if(bodystructure.childNodes){
				bodystructure.childNodes.forEach(function(bs, index){
					if(bs.type == 'text/plain'){
						messages.bodyText = handerBodyPart(bs);
					}else if(bs.type == 'text/html'){
						messages.bodyHtml = handerBodyPart(bs);
					}else if(bs.childNodes && bs.childNodes.length > 0){
						ImapClientManager.handerBodystructure(messages, bs);
					}else{
						// if(bs.type == 'application/octet-stream'){
						messages.attachments.push(handerBodyPart(bs));
						// }
					}
				});
			}
			// }
		}

	}
}

function setDntHeader(message, rev){
	var dntHeader = message['body[header.fields ("disposition-notification-to")]'];
	dntHeader = dntHeader ? dntHeader.trim() : "";
	if(dntHeader){
		try{
			var dntValue = dntHeader.replace(/[^:]+:/,"");//取冒号右侧字符
			var dntNameParts = [],dntName = "";
			if (dntValue.includes("\""))
			{
				//带引号的情况，格式如：" "=?gb18030?B?x8zDqw==?=" <736775410@qq.com>"
				dntNameParts = dntValue.match(/\"([^\"]*)\"/);//取引号内值，结果如[""=?gb18030?B?TGl0YW50?="", "=?gb18030?B?TGl0YW50?="]
				dntName = dntNameParts && dntNameParts.length > 1 ? dntNameParts[1] : "";

			}
			else{
				/*不带引号的情况，格式如（有回车符）：" =?UTF-8?Q?=E9=99=88=E5=BF=97=E5=9F=B9?=
				<hotoa@petrochina.com.cn>"
				*/
				//163邮箱格式为：18605199364@163.com，不带引号也不带回车，没有用户名，这时就直接取内容。
				dntNameParts = dntValue.match(/[^\r\n]+/g)//按回车符分割
				dntName = dntNameParts && dntNameParts.length > 0 ? dntNameParts[0] : "";
				dntName = dntName.trim();
			}
			var dntInBrackets = dntValue.match(/<([^<>]*)>/);//取尖括号内值，结果如["<262370136@qq.com>", "262370136@qq.com"]
			var dntAddress = "";
			if (dntInBrackets){
				dntAddress = dntInBrackets.length > 1 ? dntInBrackets[1] : "";
			}
			else{
				dntAddress = dntName;
			}
			rev["dispositionNotificationTo"] = {
				name: mimeWordDecode(dntName),
				email: dntAddress
			};
		}
		catch(err){
			console.error("设置header dispositionNotificationTo时出错：");
			console.error(err);
			console.error(message);
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

	/*
	message['body[header.fields ("disposition-notification-to")]']值格式如下：
	"Disposition-Notification-To: "=?gb18030?B?TGl0YW50?=" <262370136@qq.com>

"
	 */

	// rev.attachments = new Array(), bodyText = "", bodyHtml = "";
	try{
		ImapClientManager.handerBodystructure(rev, rev.bodystructure);
	}catch(err){
		console.error(err);
		console.error(message);
	}
	return rev;
}

ImapClientManager.mailBoxMessages = function(path, callback, init){
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

	var sequence_s = loadedMxistsIndex <= MailPage.pageSize ? 1 : (loadedMxistsIndex - MailPage.pageSize + 1);

	var sequence = sequence_s + ":" + loadedMxistsIndex;

	var options = {};

	console.info("listMessages path[" + path + '] sequence[' + sequence + ']');

	ImapClientManager.listMessages(null, path, sequence, options, function(messages){
		ImapClientManager.updateLoadedMxistsIndex(path, sequence_s - 1);
		if(typeof(callback) == "function"){
			callback(messages);
		}
	}, init);
}


ImapClientManager.getNewMessage = function(path, callback){
	var box = MailManager.getBox(path);

	if(!box)
		return ;

	if(box.info){
		var sequence = box.info.uidNext + ":" + (box.info.uidNext + MailPage.pageSize - 1);
		var options = {byUid: true};
		ImapClientManager.listMessages(null, path, sequence, options, function(messages){
			callback(messages);
		});
	}
}



ImapClientManager.getMessageByUid = function(path, sequence, bodyPart, callback){
	var options = {byUid: true};

	try{
		ImapClientManager.getMessageBodyByPart(null, path, sequence, options, bodyPart, callback);
	}catch(err){
		console.error(err);
	}
}

ImapClientManager.getAttachment = function(path , sequence, bodyPart, callback){
	var options = {byUid: true};

	try{
		ImapClientManager.getMessageBodyByPart(null, path, sequence, options, bodyPart, callback);
	}catch(err){
		console.error(err);
	}
}

//设置已读
ImapClientManager.updateSeenMessage = function(path, uid, callback){
	var message = MailManager.getMessageByUid(path, uid);
	ImapClientManager.setFlags(null, path, uid, {set: ['\\Seen']}, {byUid:true}, function(messages){
		messages.forEach(function(m){
			MailCollection.getMessageCollection(path).update(message._id, {$set:{flags: m.flags}});
			if(LocalhostBox.inbox_uids.indexOf(uid) > -1)
				LocalhostBox.write(path, true)
		})
		callback();
	})

}
