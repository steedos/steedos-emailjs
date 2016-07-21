'use strict';

var ImapClient = require('emailjs-imap-client')
var client = new ImapClient('msg.petrochina.com.cn', 993,{auth:{user:'hotoa@petrochina.com.cn',pass:'邮箱密码'}})


var MimeParser  = require('emailjs-mime-parser');

var encoding = require('emailjs-stringencoding');



function uint8ArrayToString(charset, uint8Array){
	return (new encoding.TextDecoder(charset).decode(uint8Array));
}

client.connect().then(() => { 
	client.listMailboxes().then((mailboxes) => {

		console.log("loading listMailboxes start..."); 
		console.log("mailboxes is " + mailboxes.children.length);  

		var children = mailboxes.children;
		children.forEach(function(c){
			console.log("box name is " + c.name + "; box object is" + JSON.stringify(c))
		});
	})
}).then(() => {
	var query = {unseen: true};
	var boxName = "INBOX";

	query = {header: ['Subject', 'subject']};
	//query = {header: ['Subject', '中文测试Subject']};
	query = {header: ['Subject', '主题']}; // 支持模糊查找
	// 此查询只返回UID
	client.search(boxName,query).then((result) => {
		// console.log("loading search start...")
		console.log(JSON.stringify(result));
	    result.forEach((uid) => console.log('Message uid ' + uid));
	});

}).then(() => {

	var boxName = "INBOX";
	var sequence = "6106:6109" // "6121,6122,6123,6124,6125"
	client.listMessages(boxName, sequence, ['uid', 'flags', 'body[]','envelope','bodystructure']).then((messages) => {
		
	    messages.forEach((message) =>{

	    	/*
				{
			        "date": "Fri, 13 Sep 2013 15:01:00 +0300",
			        "subject": "hello 4",
			        "from": [{"name": "sender name", "address": "sender@example.com"}],
			        "to": [{"name": "Receiver name", "address": "receiver@example.com"}],
			        "message-id": "<abcde>"
			    }

	    	*/


	    	var envelope = message["envelope"];

	    	// console.log(envelope)

	    	var date =envelope.date;

	    	var subject = envelope.subject;

	    	var from = envelope.from;

	    	var to = envelope.to;

	    	var bodystructure = message["bodystructure"];

	    	var bodyMime = message["body[]"];

	    	var parser = new MimeParser();

	    	parser.write(bodyMime);
	    	parser.end();

	    	var attachments = new Array();

	    	var bodyText = "", bodyHtml = "";

	    	//console.log(bodystructure);
	    	if(bodystructure){
		    	bodystructure.childNodes.forEach((bs,index) => {
		    		//console.log(index + "=>:" + JSON.stringify(bs));
		    		
		    		var node = parser.nodes["node"+(index+1)];

		    		// console.log("node is");
		    		// console.log(bs.disposition)

		    		if(bs.disposition == 'attachment'){
		    			var attachment = new Object();
		    			attachment.name = bs.dispositionParameters.filename;
		    			attachment.data = uint8ArrayToString("utf-8",node.content);
		    			attachments.push(attachment);
		    		}else{
		    			// console.log("bs.type is " + bs.type)
			    		if(bs.type == 'multipart/alternative'){
			    			bodyText = uint8ArrayToString(node._childNodes[0].charset,node._childNodes[0].content);
			    			bodyHtml = uint8ArrayToString(node._childNodes[1].charset,node._childNodes[1].content);
			    		}else if(bs.type == 'text/plain'){

			    			// console.log("node.charset is " + node.charset)
			    			// console.log("node.content is " + node.content)
			    			bodyText = uint8ArrayToString(node.charset,node.content);
			    			// console.log("node.bodyText is " + bodyText)
			    		}
		    		}
		    	});
	    	}

	    	console.log("邮件主题：" + subject);

	    	console.log("发件日期：" + date);

	    	console.log("发件人" + JSON.stringify({From: from}));

	    	console.log("收件人：" + JSON.stringify({To: to}));
	    	
			console.log("邮件内容：" + bodyText);

			console.log("邮件附件名称：" + JSON.stringify({attachments:attachments}));
	    	

	    	// console.log("envelope is " + JSON.stringify(message["envelope"]) )
	    	// console.log("=======================================================");
	    	// console.log("envelope is " + JSON.stringify(message["bodystructure"]) )
	    	// console.log("listMessages message.uid is " + message.uid);
	  //   	var parser = new MimeParser();
			// parser.write(message["body[]"]);
	  //   	parser.end();

	  //   	console.log( message["body[]"] )
	  //   	console.log("----------------------------------------------" )
	  //   	console.log("flags is " + message.flags )
	  //   	// console.log("content is " + JSON.stringify(parser.node.content))
	  //   	console.log("subject is " + JSON.stringify(parser.nodes.node.headers.subject[0].value))
	  //   	// console.log("path is " + JSON.stringify(parser.node.path))
	  //   	// console.log("path is " + JSON.stringify(parser.nodes.node.path))
	  //   	// console.log("node1 is ")
	  //   	// console.log(parser.nodes.node1)
	  //   	// console.log("content is ")
	  //   	// console.log(parser.nodes.node1.content)


	  //   	console.log("node1.headers is " + JSON.stringify(parser.nodes.node1.headers))
	  //   	//console.log(parser.nodes.node1)
	  //   	console.log("parser.nodes.node1['_childNodes'] is ")
	  //   	console.log(parser.nodes.node1["_childNodes"])
	  //   	console.log("node1_childNodes0.headers is " + JSON.stringify(parser.nodes.node1._childNodes[0].headers))
	  //   	console.log("node1_childNodes1.headers is " + JSON.stringify(parser.nodes.node1._childNodes[1].headers))
	  //   	console.log("node1_childNodes0.content is " + JSON.stringify(parser.nodes.node1._childNodes[0].content))
	  //   	console.log("node1_childNodes1.content is " + JSON.stringify(parser.nodes.node1._childNodes[1].content))


	  //   	var contentUint8Array = parser.nodes.node1._childNodes[0].content

	  //   	var charset = parser.nodes.node1._childNodes[0].charset;

	  //   	var content = new encoding.TextDecoder(charset).decode(contentUint8Array);

	  //   	console.log("content is " + content);

	    	// // console.log("node2.headers is " + JSON.stringify(parser.nodes.node2.headers))
	    	// //console.log("node3.charset is " + JSON.stringify(parser.nodes.node3.charset))
	    	// console.log("node2.content is " + JSON.stringify(parser.nodes.node2.content))

	    	// console.log("attachment data is " + uint8ArrayToString("utf-8",parser.nodes.node2.content))
	    	// //console.log(parser.nodes.node2)
	    	// console.log("=======================parser end==============================");
	    	// console.log(parser.nodes.node2.charset)
	    	// console.log("node2 is " + JSON.stringify(parser.nodes.node2.path))

	    	//console.log("childNodes is " + JSON.stringify(parser2.node))

	    	// console.log("=======================contentTransferEncoding end==============================");
	    	// console.log(parser)
	    	// console.log("=======================parser end==============================");



	    });
	});
});


// client.listMailboxes().then((mailboxes) => {

// 	console.log("client.listMailboxe start..."); 
// 	console.log("mailboxes.children is " + mailboxes.children.length);  

// 	var children = mailboxes.children;
// 	children.forEach(function(c){
// 		console.log(JSON.stringify(c))
// 	});
// 	console.log("client.listMailboxe end..."); 

// })