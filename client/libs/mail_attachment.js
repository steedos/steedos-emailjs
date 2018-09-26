
var fs, path, os, exec, dirname, dirtemp, MimeCodec , mime;



if(Steedos.isNode()){
	fs = nw.require("fs");
	path = nw.require('path');
	os = nw.require('os');
	exec = nw.require('child_process').exec;

	dirname = path.join(path.normalize(process.env.USERPROFILE), "Steedos");

	dirtemp = process.env.TEMP;

	MimeCodec = require('emailjs-mime-codec');
}


MailAttachment = {};


MailAttachment.openFile = function(attachPath, name){
	var cmd = 'start "" ' + '\"' + path.join(attachPath, name) + '\"';
	if (os.platform() == 'darwin')
		cmd = 'open "" ' + '\"' + path.join(attachPath, name) + '\"';

	// var openFilePath = path.join(process.env.HOMEDRIVE, '\"'  + path.join(process.env.HOMEPATH,"Downloads") + '\"');
    //
	// var openFileCMD = "explorer " + dirname;
    //
	// exec(openFileCMD, function(error, stdout, stderr){
	// 	if (error){
	// 		console.log("文件已关闭：" + error);
	// 	}
	// });
	
	//判断是否是.eml文件,如果不是.eml文件，则还需要打开该文件
	// var nameLen = name.length;
	// var emlLen = name.indexOf(".eml");
	// if(emlLen != (nameLen - 4)){
	// cmd += path.join(attachPath, '\"' + name + '\"');
	// cmd += '\"' + path.join(attachPath, name) + '\"';
	exec(cmd, function(error,stdout,stderr){
		console.log("文件已关闭：" + dirname);
	});
	// }
}

//data_array: 此值应该来自于 Array.from(Uint8Array)   // new Buffer(new Uint8Array(data_array))
MailAttachment.save = function(name, data, attachPath, callback){

	var filePath = path.join(path.normalize(attachPath), name);

	var file = fs.createWriteStream(filePath);
	file.write(new Buffer(data), function (err) {
		file.end();
        if (err) throw err;
        callback(attachPath, name, filePath);
    })
}

MailAttachment.saveAs = function (name, data, attachPath, callback) {
    var filePath = path.join(path.normalize(attachPath), name);

    var file = new File([data], name, {type: steedosMime.lookup(name)});
    FileSaver.saveAs(file);

    callback(attachPath, name, filePath);
}

MailAttachment.handerInline = function(path, message){
	try{
		var imgs = $(message.bodyHtml.data).find("img");

		// var hasInline = false;

		imgs.each(function(){
			var img = $(this);
			var src = img.prop("src");
			if(src.split("cid:").length > 1){
				// hasInline = true;
				var cid = src.split("cid:")[1];
				message.attachments.forEach(function(att){
					if(att.bodyPart.id == '<' + cid + '>'){
						ImapClientManager.getAttachmentByPart(path, message.uid, att.bodyPart, function(filename, data){
							message.bodyHtml.data = message.bodyHtml.data.replace(src, "data:image/png;base64," + MimeCodec.base64.encode(data))
							MailCollection.getMessageCollection(path).update(message._id ,message);
							// img.prop("src","data:image/png;base64," + MimeCodec.base64.encode(data));
						});
					}
				})
			}
		});
	}catch(e){
		return ;
	}
}


MailAttachment.download = function(path, uid, bodyPart, saveAs, attachPath, callback){
	ImapClientManager.getAttachmentByPart(path, uid, bodyPart, function(filename, data){
		fs.exists(attachPath, function(exists){
            if(saveAs){
                MailAttachment.saveAs(filename, data, attachPath, function(attachPath, name, filePath){
                    callback(attachPath, name, filePath);
                })
            }else{
                if(!exists){
                    fs.mkdir(attachPath, function(err) {
                        if (err) {
                            toastr.error(err);
                        }else{
                            MailAttachment.save(filename, data, attachPath, function(attachPath, name, filePath){
                                callback(attachPath, name, filePath);
                            })
                        }
                    })
                }else{
                    MailAttachment.save(filename, data, attachPath, function(attachPath, name, filePath){
                        callback(attachPath, name, filePath);
                    })
                }
            }
		})
	})
}

MailAttachment.fileExists = function(filePath,name){
	var file = path.join(filePath,name);
	
	if (fs.existsSync(file))
		return true;
	
	return false;
}

MailAttachment.downloadPath = function(){
	try{
		var mailBox = Session.get("mailBox");
		
		var message = MailManager.getMessage(parseInt(Session.get("mailMessageId")));
		
		var box = MailManager.getBox(Session.get("mailBox"));

		var uid = message.uid;
		
		if (box.path == "Drafts")
			return;

		if (box.path == "Inbox")
			mailBox = "inbox";
		
		if (JSON.stringify(message) == "{}")
			uid = box.info.uidNext;

		var userFolder = LocalhostData.mkdirFolder(Session.get('email_account'));

		var userInboxFolder = LocalhostData.mkdirFolder(mailBox, userFolder);
		
		var emailFolder = LocalhostData.mkdirFolder(uid.toString(), userInboxFolder);

	}catch(e){
		$(document.body).removeClass('loading');
		console.error("Open attachment error: ", e);
		return;
	}
	
	if (emailFolder)
		return emailFolder;
	else 
		return dirname;
}

MailAttachment.attachFilePath = function(filePath,name){
	return path.join(filePath,name);
}

MailAttachment.check = function(fileName){
	if(!fileName){
		return;
	}

	var f = fileName.split(".");
	var badFile = ['exe','bat','msi','vbs','js','cmd','scr','reg'];
	if(f.length > 1){
		var ftype = f[f.length-1].toLowerCase();

		if(badFile.indexOf(ftype) > -1){
			return false
		}
	}

	return true;
}

MailAttachment.getAttachmentIcon = function(fileName){
	if(!fileName){
		return;
	}

	var f = fileName.split(".");

	var key = "default", icon = {};

	icon.image = "fa fa-file-image-o";

	icon.pdf = "fa fa-file-pdf-o";

	icon.word = "fa fa-file-word-o";

	icon.excel = "fa fa-file-excel-o";

	icon.ppt = "fa fa-file-powerpoint-o";

	icon.zip = "fa fa-file-zip-o";

	icon.text = "fa fa-file-text-o";

	icon.code = "fa fa-file-code-o";

	icon.default = "fa fa-file-o";

	var image = ["ico", "png", "bmp", "jpg", "tiff", "gif", "pcx", "tga", "exif", "fpx", "svg", "psd", "cdr", "pcd", "dxf", "ufo", "eps", "ai", "raw"];

	var pdf = ["pdf"];

	var word = ["doc", "docx"];

	var excel = ["xls", "xlsx"];

	var ppt = ["ppt", "pptx"];

	var zip = ["rar", "zip", "tar", "cab", "uue", "jar", "iso", "z", "7-zip", "ace", "lzh", "arj", "gzip", "bz2"];

	var text = ["txt", "json", "xml"];

	var code = ["js", "css", "html", "jsp", "java", "class", ".sql"];

	if(f.length > 1){
		var ftype = f[f.length-1].toLowerCase();

		if(image.indexOf(ftype) > -1)
			key = "image";
		else if(pdf.indexOf(ftype) > -1)
			key = "pdf";
		else if(word.indexOf(ftype) > -1)
			key = "word";
		else if(excel.indexOf(ftype) > -1)
			key = "excel";
		else if(ppt.indexOf(ftype) > -1)
			key = "ppt";
		else if(zip.indexOf(ftype) > -1)
			key = "zip";
		else if(text.indexOf(ftype) > -1)
			key = "text";
		else if(code.indexOf(ftype) > -1)
			key = "code";
	}

	return icon[key];
}

MailAttachment.getAttachmentName = function(filePath){
	var atts = filePath.split("\/");

	var atts2 = filePath.split("\\");

	var attchmentname = atts.length > atts2.length? atts[atts.length - 1] : atts2[atts2.length - 1];

	return attchmentname;
}

MailAttachment.formatFileSize = function(size){
	var rev = size / 1024.00;
    var unit = 'KB';

    if(rev > 1024.00){
      rev = rev / 1024.00;
      unit = 'MB';
    }

    if(rev > 1024.00){
      rev = rev / 1024.00;
      unit = 'GB';
    }

    return rev.toFixed(2) + unit;
}

MailAttachment.getAttachmentNode = function(filePath, fileSize){

	var name = MailAttachment.getAttachmentName(filePath);
	var node = "";
	if(name){
		node = '<div class="col-md-12 col-sm-12 col-xs-12 attachment-item" id="mail_attachment" name="mail_attachment" data-path="'+filePath+'" data-name="'+name+'" data-file-size="'+fileSize
+'"><div class="attachment-info-box"><span class="attachment-info-box-icon"><i class="'+MailAttachment.getAttachmentIcon(name)+'"></i></span><div class="attachment-info-box-content"><span class="attachment-info-box-text">' + name + '</span>' + '<span class="mailbox-attachment-size">' + MailAttachment.formatFileSize(fileSize) + '<span class="text_link mailbox-attachment-delete">删除</span></span></div></div></div>';
		//var node = '<li><div class="mailbox-attachment-info"><a href="#" id="mail_attachment" name="mail_attachment" class="mailbox-attachment-name" data-path="'+filePath+'" data-name="'+name+'"><i class="fa fa-paperclip"></i> ' + name + '</a><span class="mailbox-attachment-size"></span><span class="text_link mailbox-attachment-delete">删除</span></div></li>'
	}
	return node;
}


MailAttachment.mailCodeDownload = function(path, uid, saveAs, emailFolder, callback){
	try{
		ImapClientManager.getMailCode(path, uid, function(filename, data){
            if(saveAs){
                MailAttachment.saveAs(filename, data, emailFolder, function(emailFolder, name, filePath){
                	callback(emailFolder, name, filePath);
				})
            }else{
                fs.exists(emailFolder, function(exists){
                    if(!exists){
                        fs.mkdir(emailFolder, function(err) {
                            if (err) {
                                toastr.error(err);
                            }else{
                                MailAttachment.save(filename, data, emailFolder, function(emailFolder, name, filePath){
                                    callback(emailFolder, name, filePath);
                                })
                            }
                        })
                    }else{
                        MailAttachment.save(emailFolder, data, emailFolder, function(emailFolder, name, filePath){
                            callback(emailFolder, name, filePath);
                        })
                    }
                })
            }
		});
	}catch(e){
		Session.set("mailSending",false);
		return ;
	}
}
