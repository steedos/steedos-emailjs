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

	var options = {auth:auth};

	if (!domain.smtp_ssl){
		options.useSecureTransport = false;
		options.ignoreTLS = false;
	}
	
	var client = new SmtpClient(domain.smtp_server, domain.smtp_port, options);

	return client;
}


SmtpClientManager.sendMail = function(to, cc, bcc,subject, body, attachments, callback){
	$("#mail_sending").show();
	var client;
	try{
		//toastr.info("邮件发送中...");
		console.log("SmtpClientManager.sendMai start");

		var auth = AccountManager.getAuth();
		var from = auth.user;

		client = SmtpClientManager.getClient();

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
	    		toastr.success("发送成功");
	    		callback(FlowRouter.go('/emailjs/b/Sent'));
	    		$("#mail_sending").hide();
   			}else{
   				toastr.success("发送不成功");
   				$("#mail_sending").hide();
   			}
        }

        client.onerror = function(err){
        	client.onclose(isError);
        }

        client.connect();

	}catch(e){
		console.error(e);
	}finally{
     	client.close();
     	
    }

}

