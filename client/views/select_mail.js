Template.select_mail.events({
    'click .select_contacts': function(event, template){
        Modal.show("contacts_modal", {targetId: event.target.dataset.id, target: template.data.target});
    }
})

Template.select_mail.rendered = function(){

    var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@' +
                       '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';

    var formatName = function(item) {
        return $.trim((item.first_name || '') + ' ' + (item.last_name || ''));
    };

    var selectizeOpt = {
        plugins: ['remove_button'],
        persist: false,
        maxItems: null,
        valueField: 'return',
        labelField: 'name',
        searchField: ['first_name', 'last_name', 'email', 'organizations'],
        openOnFocus: false,
        sortField: [
            {field: 'first_name', direction: 'asc'},
            {field: 'last_name', direction: 'asc'}
        ],
        options: [
            // {email: '<hotoa@petrochina.com.cn>', first_name: '测试-', last_name: 'Hotoa', return: JSON.stringify({name:'测试', email: '<hotoa@petrochina.com.cn>'})}
        ],
        render: {
            item: function(item, escape) {
                var name = formatName(item);
                return '<div>' +
                    (name ? '<span class="name">"' + escape(name) + '</span>' : '') +
                    (item.organizations ? '<span class="organizations"> (' + escape(item.organizations) + ')"</span>' : '') +
                    (item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
                '</div>';
            },
            option: function(item, escape) {
                var name = formatName(item);
                var label = name || item.email;
                var caption = name ? item.email : null;
                var org = item.organizations;
                return '<div>' +
                    '<span class="label">"' + escape(label) + '</span>' +
                    (org ? '<span class="org"> (' + escape(org) + ')"</span>' : '') +
                    (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                '</div>';
            }
        },
        load: function(query, callback) {
            if (!query.length) return callback();

                var res = [];

                var books = db.address_books.find({email:{$regex: query}},{fields: {_id: 1, email: 1, name: 1},skip:0,limit:10}).fetch();

                books.forEach(function(b){
                  res.push({email: "<" + b.email + ">", first_name: b.name, last_name: '', return: JSON.stringify({name: b.name, email: "<" + b.email + ">"})});
                });

                var users = SteedosDataManager.spaceUserRemote.find({email:{$regex: query}},{fields: {_id: 1, email: 1, name: 1, organizations:1},skip:0,limit:10});

                users.forEach(function(u){
                    var len = u.organizations.length;
                    var orgId = u.organizations[0];
                    var orgName = SteedosDataManager.organizationRemote.findOne({_id:orgId},{fields:{name: 1}}).name;
                    if(!orgName){
                      orgName = '';
                    }
                    res.push({email: "<" + u.email + ">", first_name: u.name, last_name: '', organizations: orgName, return: JSON.stringify({name: u.name, organizations: orgName, email: "<" + u.email + ">"})});
                });

                callback(res);
        },
        createFilter: function(input) {
            var regexpA = new RegExp('^' + REGEX_EMAIL + '$', 'i');
            var regexpB = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');
            return regexpA.test(input) || regexpB.test(input);
        },
        create: function(input) {

            if ((new RegExp('^' + REGEX_EMAIL + '$', 'i')).test(input)) {
                return {
                    email: "<" + input + ">",
                    first_name: "",
                    last_name: "",
                    return: JSON.stringify({name:"",email:"<" + input + ">"})
                };
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
                    last_name: last_name,
                    return: JSON.stringify({name:name, email:"<" + match[2] + ">"})
                };
            }
            alert('Invalid email address.');
            return false;
        }
    }


    this.data.target = $('#' + this.data.atts.id).selectize(selectizeOpt);

    var values = this.data.values;
    if(values && (values instanceof Array)){
        values.forEach(function(val){
          var user = SteedosDataManager.spaceUserRemote.find({email:{$regex: val.address}},{fields: {organizations:1}});
          if(user.length > 0){
            var orgId = user[0].organizations[0];
            var orgName = SteedosDataManager.organizationRemote.findOne({_id:orgId},{fields:{name: 1}}).name;
            if(!orgName){
              orgName = '';
            }
            val.organization = orgName;
          }
        })
    }

    var selectize = this.data.target[0].selectize;

    if(values && (values instanceof Array)){
        values.forEach(function(v){
          if(v.name && v.organization && !Session.get("mailReply") && !Session.get("mailReplyAll")){
            selectize.createItem(v.name+ "\ " +"(" + v.organization + ")" + "\"" + "<" + v.address + ">");
          }else if(v.name){
            selectize.createItem(v.name + "\"" + "<" + v.address + ">");
          }else {
            selectize.createItem("<" + v.address + ">");
          }
        });
    }
}
