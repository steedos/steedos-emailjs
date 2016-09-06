
var fs, path, os, exec, dirname, dirtemp ;



if(window.require){
	fs = window.require("fs");
	path = require('path');
	os = window.require('os');
	exec = window.require('child_process').exec;
}


if(Steedos.isNode()){

	dirname = path.join(path.normalize(process.env.HOME? process.env.HOME : process.env.USERPROFILE), "Downloads");
	
	dirtemp = process.env.TEMP;
}


MailAttachment = {};


MailAttachment.openFile = function(dirname, name){

	var cmd = os.platform() == 'darwin' ? 'open -W ' : 'start /wait ';

	cmd += path.join(path.normalize(dirname), '\"' + name + '\"');
    
    exec(cmd, function(error,stdout,stderr){
    	console.log("文件已关闭：" + dirname);
    });
}

//data_array: 此值应该来自于 Array.from(Uint8Array)   // new Buffer(new Uint8Array(data_array))
MailAttachment.save = function(name, data, callback){

	var filePath = path.join(path.normalize(dirname), name);

	fs.writeFile(filePath, new Buffer(data), function (err) {
        if (err) throw err;
        console.log("Export Account Success!");
        callback(dirname, name, filePath);
    })
}


MailAttachment.download = function(path, uid, bodyPart, callback){

	ImapClientManager.getAttachmentByPart(path, uid, bodyPart, function(filename, data){
		MailAttachment.save(filename, data, function(dirname, name, filePath){
			callback(dirname, name, filePath);
		})
	});

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

	icon.ppt = "fa fa-file-ppt-o";

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

function getAttachmentName(filePath){
	var atts = filePath.split("\/");

	var atts2 = filePath.split("\\");

	var attchmentname = atts.length > atts2.length? atts[atts.length - 1] : atts2[atts2.length - 1];

	return attchmentname;
}

MailAttachment.getAttachmentNode = function(filePath){

	var name = getAttachmentName(filePath);
	var node = "";
	if(name){
		node = '<div class="col-md-3 col-sm-4 col-xs-6" id="mail_attachment" name="mail_attachment" data-path="'+filePath+'" data-name="'+name+'"><div class="attachment-info-box"><span class="attachment-info-box-icon"><i class="'+MailAttachment.getAttachmentIcon(name)+'"></i></span><div class="attachment-info-box-content"><span class="attachment-info-box-text">' + name + '</span><span class="text_link mailbox-attachment-delete">删除</span></div></div></div>';
		//var node = '<li><div class="mailbox-attachment-info"><a href="#" id="mail_attachment" name="mail_attachment" class="mailbox-attachment-name" data-path="'+filePath+'" data-name="'+name+'"><i class="fa fa-paperclip"></i> ' + name + '</a><span class="mailbox-attachment-size"></span><span class="text_link mailbox-attachment-delete">删除</span></div></li>'
	}
	return node;
}

