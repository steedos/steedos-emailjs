Mail.listUnseenMessages = function(){
  var unseenUids = MailUnseendisplay.getUnseenUids();
  return MailUnseendisplay.listUnseenMessages(unseenUids, callback);
}
