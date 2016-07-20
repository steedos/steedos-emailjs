'use strict';

var ImapClient = require('emailjs-imap-client')
var client = new ImapClient('msg.petrochina.com.cn', 993,{auth:{user:'hotoa@petrochina.com.cn',pass:'密码'}})


var MimeParser  = require('emailjs-mime-parser');

var encoding = require('emailjs-stringencoding');

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
	query = {header: ['Subject', '中文测试Subject']};
	query = {header: ['Subject', '主题']}; // 支持模糊查找
	// 此查询只返回UID
	client.search(boxName,query).then((result) => {
		// console.log("loading search start...")
		console.log(JSON.stringify(result));
	    result.forEach((uid) => console.log('Message uid ' + uid));
	});

}).then(() => {

	var boxName = "INBOX";
	var sequence = "6104" // "6121,6122,6123,6124,6125"
	client.listMessages(boxName, sequence, ['uid', 'flags', 'body[]']).then((messages) => {
		
	    messages.forEach((message) =>{
	    	// console.log("message is " + JSON.stringify(message["body[]"]) )
	    	console.log("listMessages message.uid is " + message.uid);
	    	var parser = new MimeParser();
			parser.write(message["body[]"]);
	    	parser.end();

	    	console.log("flags is " + message.flags )
	    	// console.log("header is " + JSON.stringify(parser.node.header))
	    	// console.log("content is " + JSON.stringify(parser.node.content))
	    	// console.log("headers is " + JSON.stringify(parser.node.headers))
	    	console.log("subject is " + JSON.stringify(parser.node.headers.subject[0].value))
	    	// console.log("path is " + JSON.stringify(parser.node.path))
	    	// console.log("path is " + JSON.stringify(parser.nodes.node.path))
	    	// console.log("node1 is ")
	    	// console.log(parser.nodes.node1)
	    	// console.log("content is ")
	    	// console.log(parser.nodes.node1.content)

	    	var contentUint8Array = parser.nodes.node1.content

	    	var content = new encoding.TextDecoder("utf-8").decode(contentUint8Array);

	    	console.log("content is " + content);

	    	// console.log("node1.headers is " + JSON.stringify(parser.nodes.node1.headers))
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