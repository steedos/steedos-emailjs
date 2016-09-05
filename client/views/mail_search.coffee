Template.mail_search.events
    'keydown .search-mail-input': (event, template) ->
        if event.keyCode == 13
            searchKey = event.target.value

            if searchKey.trim() == ''
                Session.set("mailBoxFilter","");
                return;

            Session.set("mailLoading",true);
            
            console.log("keydown search-mail-input searchKey:" + searchKey);

            queryKey = {};

            queryKey.keyword = searchKey;

            queryKey.subject = true;

            MailManager.search queryKey, (result,messages) ->
                Session.set("mailBoxFilter", result);
                Session.set("mailLoading",false);

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