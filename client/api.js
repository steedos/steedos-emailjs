Mail = {};

//得到前10封未读邮件的message
Mail.getUnseenMessages = function(){
  MailUnseendisplay.listUnseenMessages();
  var unseenUids = MailUnseendisplay.getUnseenUids();
  var messages = MailCollection.getMessageCollection("Inbox").find({uid:{$in: unseenUids}}, {sort: {uid:-1}, skip: 0, limit: 10}).fetch();
  return  messages;
}
