
@LocalhostDraft = {}

if Steedos.isNode()
	if LocalhostData.exists('draft_data.json')
		Session.set("localhost_draft", true)
	else
		Session.set("localhost_draft", false)


LocalhostDraft.write = (message)->
	_db_m = MailCollection.getMessageCollection(MailManager.getBoxBySpecialUse('\\Drafts').path).findOne({uid: message.uid})

	message.summary = false

	message.date = (new Date())

	if _db_m
		MailCollection.getMessageCollection(MailManager.getBoxBySpecialUse('\\Drafts').path).update({uid: message.uid}, message)
	else
		MailCollection.getMessageCollection(MailManager.getBoxBySpecialUse('\\Drafts').path).insert(message)

	LocalhostData.write(message.uid.toString(), JSON.stringify(message), LocalhostData.userDraftFolder)


LocalhostDraft.read = (fileName)->
	fileName = fileName.toString()
	try
		if LocalhostData.exists(fileName, LocalhostData.userDraftFolder)
			data = LocalhostData.read(fileName, LocalhostData.userDraftFolder)
			message = JSON.parse(data)
			_db_m = MailCollection.getMessageCollection(MailManager.getBoxBySpecialUse('\\Drafts').path).findOne({uid: message.uid})
			message.summary = false
			if _db_m
				MailCollection.getMessageCollection(MailManager.getBoxBySpecialUse('\\Drafts').path).update({uid: message.uid}, message)
			else
				MailCollection.getMessageCollection(MailManager.getBoxBySpecialUse('\\Drafts').path).insert(message)
			return message;
	catch e
		console.error('本地缓存文件损坏')
		return false;
	return false;


LocalhostDraft.load = ()->
	fileNames = LocalhostData.getFolderFileNames(LocalhostData.userDraftFolder)
	fileNames.forEach (fileName)->
		LocalhostDraft.read(fileName)


LocalhostDraft.delete = (uids)->
	console.log('delete uids', uids)
	uids.forEach (uid)->
		if Number(uid) > 1262304000000
			LocalhostData.unlink(uid.toString(), LocalhostData.userDraftFolder)