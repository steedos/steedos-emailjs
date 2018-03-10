@LocalhostData = {}

if Steedos.isNode()
	fs = nw.require("fs");
	path = nw.require('path');

	LocalhostData.tempPath = path.join process.env.USERPROFILE, "Steedos"

	LocalhostData.tempDraftFilePath = path.join LocalhostData.tempPath, "draft_data.json"

console.log "LocalhostData.tempPath ", LocalhostData.tempPath

if Steedos.isNode()
	if !fs.existsSync(LocalhostData.tempPath)
		fs.mkdirSync(LocalhostData.tempPath)

LocalhostData.read = (fileName)->
	if Steedos.isNode()
		_path = path.join LocalhostData.tempPath, fileName

		data = fs.readFileSync _path, "utf-8"

		return data

LocalhostData.write = (fileName, data)->
	if Steedos.isNode()
		_path = path.join LocalhostData.tempPath, fileName

		if _.isObject(data)
			data = JSON.stringify(data)

		fs.writeFileSync(_path, data)

LocalhostData.unlink = (fileName)->
	if Steedos.isNode()
		_path = path.join LocalhostData.tempPath, fileName
		fs.unlinkSync(_path)

LocalhostData.exists = (fileName)->
	if Steedos.isNode()
		_path = path.join LocalhostData.tempPath, fileName
		return fs.existsSync(_path)