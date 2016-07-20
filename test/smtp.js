'use strict';

/*
petrochina.com.cn
	imap: msg.petrochina.com.cn ：993
	smtp: msg.petrochina.com.cn ：465

*/

var MimeBuilder = require('emailjs-mime-builder')
var SmtpClient = require('emailjs-smtp-client')
var fs = require('fs');
var client = new SmtpClient('msg.petrochina.com.cn', 465,{auth:{user:'hotoa@petrochina.com.cn',pass:'邮箱密码'}})

var alreadySending  = false;

client.onidle = function(){
    console.log("Connection has been established");
    if(alreadySending ){
    	client.close();
    	return 
    }

    alreadySending = true;

    client.useEnvelope(
    	new MimeBuilder().addHeader({
		        from: "HOTOA <hotoa@petrochina.com.cn>",
		        to: "hotoa@petrochina.com.cn"
		    }).getEnvelope()
    )
}

client.onready = function(){
	var attachment_data = fs.readFileSync('中文.txt','utf-8'); 

	console.log(attachment_data)

	var node = new MimeBuilder("multipart/mixed").addHeader({ Subject: "中文测试Subject"});

	node.createChild("text/plain").setContent("中文测试Body");

	node.createChild(false, {filename: "中文.txt"}).setContent(attachment_data).setHeader("Content-Disposition", "attachment");
	node.createChild(false, {filename: "中文2.txt"}).setContent(attachment_data).setHeader("Content-Disposition", "attachment")


	client.send(node.build());

    client.end();
}

client.connect();
// client.onidle();
// client.onready();