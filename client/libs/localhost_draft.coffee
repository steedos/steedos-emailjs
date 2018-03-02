

if LocalhostData.exists('draft_data.json')
	Session.set("localhost_draft", true)
else
	Session.set("localhost_draft", false)