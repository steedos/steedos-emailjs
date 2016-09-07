Template.layout_right.helpers
	isComPose: ->
		return Session.get("mailBox") == "compose" || Session.get("mailForward") || Session.get("mailReply") || Session.get("mailReplyAll") || Session.get("mailJumpDraft")
	isRead: ->
		return Session.get("mailMessageId")
	isLoading: ->
		return Session.get("mailLoading");