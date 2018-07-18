@LocalhostData = {}

if Steedos.isNode()
	fs = nw.require("fs");
	path = nw.require('path');

	LocalhostData.tempPath = path.join process.env.USERPROFILE, "Steedos"

	LocalhostData.tempDraftFilePath = path.join LocalhostData.tempPath, "draft_data.json"
	LocalhostData.tempInboxFilePath = path.join LocalhostData.tempPath, "inbox_data.json"

console.log "LocalhostData.tempPath ", LocalhostData.tempPath

if Steedos.isNode()
	if !fs.existsSync(LocalhostData.tempPath)
		fs.mkdirSync(LocalhostData.tempPath)

LocalhostData.mkdirFolder = (folder, folderPath)->
	_path = path.join LocalhostData.tempPath, folder
	if folderPath
		_path = path.join folderPath, folder
	if !fs.existsSync(_path)
		fs.mkdirSync(_path)
	return _path

LocalhostData.read = (fileName, folderPath)->
	if Steedos.isNode()
		_path = path.join LocalhostData.tempPath, fileName

		if folderPath
			_path = path.join folderPath, fileName

		data = fs.readFileSync _path, "utf-8"

		return data

LocalhostData.write = (fileName, data, folderPath)->
	if Steedos.isNode()
		_path = path.join LocalhostData.tempPath, fileName

		if folderPath
			_path = path.join folderPath, fileName

		if _.isObject(data)
			data = JSON.stringify(data)

		fs.writeFileSync(_path, data)

LocalhostData.unlink = (fileName, folderPath)->
	if Steedos.isNode()
		_path = path.join LocalhostData.tempPath, fileName
		if folderPath
			_path = path.join folderPath, fileName
		fs.unlinkSync(_path)

LocalhostData.exists = (fileName, folderPath)->
	if Steedos.isNode()
		_path = path.join LocalhostData.tempPath, fileName
		if folderPath
			_path = path.join folderPath, fileName
		return fs.existsSync(_path)

LocalhostData.unlinkOther = (fileName, folderPath) ->
	if Steedos.isNode()
		if fs.existsSync(folderPath)
			_files = fs.readdirSync(folderPath);
			_files.forEach (_file,index) ->
				if fileName != _file
					curPath = path.join folderPath, _file;
					if !fs.statSync(curPath).isDirectory()
						fs.unlinkSync(curPath)