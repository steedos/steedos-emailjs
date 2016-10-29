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
        if Session.get("mailSending")
            $("#mail_sending").show();
        else
            $("#mail_sending").hide();
        return Session.get("mailSending");

    attachmentLoadding: ->
        if Session.get("donwLoadding")
            $("#attachment_donwLoadding").show();
        else
            $("#attachment_donwLoadding").hide();
        return Session.get("donwLoadding");


Template.layout_right.onRendered ->
    $(".right-body").perfectScrollbar();
