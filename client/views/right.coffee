Template.layout_right.helpers
    isComPose: ->
        return Session.get("mailBox") == "compose" || Session.get("mailForward") || Session.get("mailReply") || Session.get("mailReplyAll") || Session.get("mailJumpDraft")
    isRead: ->
        return Session.get("mailMessageId")
    isLoading: ->
        return Session.get("mailLoading");

    showRight: ->
        isShowRight = (Session.get("mailBox") == "compose" || Session.get("mailForward") || Session.get("mailReply") || Session.get("mailReplyAll") || Session.get("mailJumpDraft") || Session.get("mailMessageId"));
        if isShowRight
            $(".steedos-mail").addClass("right-show")
        return isShowRight;

    isSending: ->
        return Session.get("mailSending");

    attachmentLoadding: ->
        return Session.get("donwLoadding");


Template.layout_right.onRendered ->
    $(".right-body").perfectScrollbar();
