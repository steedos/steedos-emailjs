Template.mail_search.subjectSearch = ()->
    searchKey = $("#keyword0").val();
    if searchKey.trim() == ''
        Session.set("mailBoxFilter","");
        return;

    Session.set("mailLoading",true);


    MailManager.search searchKey, (result) ->
        if !result || result.length == 0
            toastr.info("未搜索到数据");
        else
            Session.set("mailPage", 1);
            Session.set("mailBoxFilter", result);
            toastr.info("搜索完成");

        Session.set("mailLoading",false);

Template.mail_search.helpers
    searchAddress: ->
        return Session.get("mailSearchAddress");

    path: ->
        return Session.get("mailBox");

    searchHelp: ->
        whichInput = Session.get("mailBox")

        switch whichInput
            when "Inbox" then text="搜索收件箱【邮件地址、标题】"
            when "&XfJT0ZAB-" then text="搜索已发送【邮件地址、标题】"
            when "&g0l6Pw-" then text="搜索草稿【邮件地址、标题】"
            when "&V4NXPpCuTvY-" then text="搜索垃圾邮件【邮件地址、标题】"
            when "&XfJSIJZkkK5O9g-" then text="搜索已删除邮件【邮件地址、标题】"
        return text

Template.mail_search.events

    #'click .search-mail-input': (event, template) ->
    #    if event.keyCode == 13
    #    Template.mail_search.subjectSearch();

    'click #mail-search-btn': (event, template) ->
        path = Session.get("mailBox");
        FlowRouter.go("/emailjs/b/search/" + path);
        Template.mail_search.subjectSearch();

    'click #advanced_search': (event, template) ->
        $("#advanced_search_modal").show();


Template.mail_search.onRendered ->
    $('#search_date_start').datetimepicker({
        format: "YYYY-MM-DD"
    });

    $('#search_date_end').datetimepicker({
        format: "YYYY-MM-DD"
    });

    # $('#daterange-btn').daterangepicker(
    #     {
    #       ranges: {
    #         '当天': [moment(), moment()],
    #         '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    #         '7天内': [moment().subtract(6, 'days'), moment()],
    #         '30天内': [moment().subtract(29, 'days'), moment()],
    #         '当月': [moment().startOf('month'), moment().endOf('month')],
    #         '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    #       },
    #       startDate: moment().subtract(29, 'days'),
    #       endDate: moment()
    #     },
    #     (start, end) ->
    #         $('#daterange-btn span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

    # );
