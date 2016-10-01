Template.select_mail.events({
    'click .select_contacts': function(event, template){
        console.log("----select_contacts----");
        Modal.show("contacts_modal", {targetId: event.target.dataset.id, target: template.data.target});
    }
})

Template.select_mail.rendered = function(){
    console.log('--rendered--');
    console.log(this.data);
    
    var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                       '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';

    var formatName = function(item) {
        return $.trim((item.first_name || '') + ' ' + (item.last_name || ''));
    };

    this.data.target = $('#' + this.data.atts.id).selectize({
        persist: false,
        maxItems: null,
        valueField: 'email',
        labelField: 'name',
        searchField: ['first_name', 'last_name', 'email'],
        openOnFocus: false,
        sortField: [
            {field: 'first_name', direction: 'asc'},
            {field: 'last_name', direction: 'asc'}
        ],
        // options: [
        //     {email: 'hotoa@petrochina.com.cn', first_name: '测试-', last_name: 'Hotoa'},
        //     {email: 'zhangshanshan@hotoa.com', first_name: '测试-', last_name: '张姗姗'},
        //     {email: 'baozhoutao@hotoa.com', first_name: '华炎-', last_name: '包周涛'}
        // ],
        render: {
            item: function(item, escape) {
                var name = formatName(item);
                return '<div>' +
                    (name ? '<span class="name">' + escape(name) + '</span>' : '') +
                    (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
                '</div>';
            },
            option: function(item, escape) {
                var name = formatName(item);
                var label = name || item.email;
                var caption = name ? item.email : null;
                return '<div>' +
                    '<span class="label">' + escape(label) + '</span>' +
                    (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                '</div>';
            }
        },
        createFilter: function(input) {
            var regexpA = new RegExp('^' + REGEX_EMAIL + '$', 'i');
            var regexpB = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
            return regexpA.test(input) || regexpB.test(input);
        },
        create: function(input) {
            console.log("selectize create...");

            if ((new RegExp('^' + REGEX_EMAIL + '$', 'i')).test(input)) {
                return {email: "<" + input + ">"};
            }
            var match = input.match(new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i'));
            if (match) {
                var name       = $.trim(match[1]);
                var pos_space  = name.indexOf(' ');
                var first_name = name.substring(0, pos_space);
                var last_name  = name.substring(pos_space + 1);

                return {
                    email: "<" + match[2] + ">",
                    first_name: first_name,
                    last_name: last_name
                };
            }
            alert('Invalid email address.');
            return false;
        }
    });


    var values = this.data.values;

    var selectize = this.data.target[0].selectize;

    if(values && (values instanceof Array)){
        values.forEach(function(v){
            selectize.createItem(v.name + "<" + v.address + ">")
        });
        
    }
}