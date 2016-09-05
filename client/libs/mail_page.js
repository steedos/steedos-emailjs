MailPage = {};

//每页显示10条邮件
MailPage.pageSize = 10;

//总页数
MailPage.pageCount  = function(boxMessageNumber){
    return boxMessageNumber % MailPage.pageSize === 0 ? boxMessageNumber / MailPage.pageSize : parseInt( boxMessageNumber / MailPage.pageSize) + 1;
}


//向后翻页
 MailPage.pageBack = function(){
 	if (Session.get("mailPage") <= 1) 
 		Session.set("mailPage", 1);
 	else 
 		Session.set("mailPage", Session.get("mailPage") - 1);
 } 

//向前翻页
MailPage.pageForward = function(boxMessageNumber){

	if (Session.get("mailPage") >= MailPage.pageCount(boxMessageNumber))
		Session.set("mailPage", MailPage.pageCount(boxMessageNumber));
	else
		Session.set("mailPage", Session.get("mailPage") + 1);		
}

//起始数
MailPage.PageStart = function(){
 	return (Session.get("mailPage") - 1)*10+1;
}

//结束数
MailPage.PageEnd = function(boxMessageNumber){

	var rev = Session.get("mailPage") * MailPage.pageSize;

	if(rev > boxMessageNumber)
		rev = boxMessageNumber;

	return rev;
}



