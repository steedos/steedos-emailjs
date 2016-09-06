SmtpClientManager = {};

var MimeBuilder, SmtpClient, MimeCodec, fs;

if(window.require){
	MimeBuilder = window.require('emailjs-mime-builder');
	SmtpClient  = window.require('emailjs-smtp-client');
	MimeCodec = require('emailjs-mime-codec');
	fs = window.require('fs');
}


SmtpClientManager.getClient = function(){
	var auth = AccountManager.getAuth();
	if(!auth)
		return ;
	var domain = AccountManager.getMailDomain(auth.user);
	
	var client = new SmtpClient(domain.smtp, domain.smtp_port,{auth:auth});

	return client;
}


SmtpClientManager.sendMail = function(to, cc, bcc,subject, body, attachments){

	var client;
	try{
		toastr.info("邮件发送中...");
		$(document.body).addClass('loading');
	    
		console.log("SmtpClientManager.sendMai start");

		var auth = AccountManager.getAuth();
		var from = auth.user;

		var	client = SmtpClientManager.getClient();

	    var alreadySending  = false;

		client.onidle = function(){
		    console.log("Connection has been established");
		    if(alreadySending ){
		    	client.close();
		    	return 
		    }

		    alreadySending = true;

		    var evnelope = {from: from, to: to};

		    if(cc && cc.length > 0){
		    	evnelope.cc = cc;
		    }

		    if(bcc && bcc.length > 0){
		    	evnelope.bcc = bcc ;
		    }

		    client.useEnvelope(new MimeBuilder().addHeader(evnelope).getEnvelope());
		}

		client.onready = function(){	

			var message = MailMimeBuilder.getMessageMime(from, to, cc, bcc, subject, body, attachments);

			client.send(message);

		    client.end();
		}
	    

	    client.ondone = function(success){ 
	    	if(success){
        		$(document.body).removeClass('loading');
        		toastr.success("发送成功");
   			}else{
   				$(document.body).removeClass('loading');
        		toastr.success("发送不成功");
   			}
        }

        client.onerror = function(err){
        	client.onclose(isError);
        }

        client.connect();

	}catch(e){
		console.log("发送不成功！错误: " + e)
	}
	finally{

     	client.close();
     	
    }

}


// $(document.body).addClass('loading');toastr.info("邮件发送中...");$(document.body).removeClass('loading');toastr.success("发送成功")
