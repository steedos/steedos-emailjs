Template.mail_search.subjectSearch = (type)->
    searchKey = $("#keyword0").val();
    if searchKey.trim() == ''
        Session.set("mailBoxFilter","");
        return;

    Session.set("mailLoading",true);


    MailManager.search searchKey, type, (result) ->
        if !result || result.length == 0
            Session.set("mailBoxFilter", [0]);
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
        box =  MailManager.getBox(Session.get("mailBox"));
        if box
            boxName = MailManager.i18n("box.name")
        else
            boxName = MailManager.i18n("INBOX")

        return "搜索#{boxName}【邮件地址、标题】"

    dropdownMenuSearchKey: ->
        return Template.instance().search_key?.get()

Template.mail_search.events

    'click .btn-search-mail': (event, template) ->
        type = event.currentTarget.dataset?.type
        path = Session.get("mailBox");
        FlowRouter.go("/emailjs/b/search/" + path);
        Template.mail_search.subjectSearch(type);

    'click #advanced_search': (event, template) ->
        $("#advanced_search_modal").show();

    'keyup .search-mail-input': (event, template) ->
        searchKey = $(".search-mail-input").val()
        template.search_key.set(searchKey);

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

Template.mail_search.onCreated ->
    this.search_key = new ReactiveVar()