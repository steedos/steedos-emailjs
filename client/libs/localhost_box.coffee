@LocalhostBox = {}

LocalhostBox.inbox_uids = []

LocalhostBox.write = (box, cover) ->
	if box.toLowerCase() == 'inbox'
		data = MailCollection.getMessageCollection(box).find({}, {sort: {uid: -1}, limit: 20}).fetch()
		LocalhostBox.inbox_uids = _.pluck data, 'uid'
		inbox = MailManager.getBoxInfo(box);
		if data.length > 0
			fileName = inbox.uidNext.toString()
			console.log('fileName', fileName)
			if !LocalhostData.exists(fileName, LocalhostData.userInboxFolder) || cover
				LocalhostData.write(fileName, JSON.stringify(data), LocalhostData.userInboxFolder)
				LocalhostData.unlinkOther(fileName, LocalhostData.userInboxFolder)



LocalhostBox.read = (box, fileName)->
	if box.toLowerCase() == 'inbox'
		try
			if LocalhostData.exists(fileName, LocalhostData.userInboxFolder)
				data = LocalhostData.read(fileName, LocalhostData.userInboxFolder)
				rev = JSON.parse(data)
				LocalhostBox.inbox_uids = _.pluck rev, 'uid'
				return rev;
		catch e
			console.error('本地缓存文件损坏，从服务器重新获取最近20封邮件')
			return false;
	return false;

