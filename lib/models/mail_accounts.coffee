db.mail_accounts = new Meteor.Collection('mail_accounts')

db.mail_accounts.allow
    update: (userId, doc, fields, modifier) ->
        return doc.owner == userId;
    
    insert: (userId, doc, fields, modifier) ->
        return doc.owner == userId;

db.mail_accounts._simpleSchema = new SimpleSchema
    space:
        type: String,
        autoform:
            type: "hidden",
            defaultValue: ->
                return Session.get("spaceId");
    owner:
        type: String,
        autoform:
            type: "hidden",
            defaultValue: ->
                return Meteor.userId();
    email:
        type: String,
    password:
        type: String,
        autoform:
            type: "password"
    
    created:
        type: Date,
        optional: true
    created_by:
        type: String,
        optional: true
    modified:
        type: Date,
        optional: true
    modified_by:
        type: String,
        optional: true


if Meteor.isClient
    db.mail_accounts._simpleSchema.i18n("mail_accounts")

db.mail_accounts.attachSchema(db.mail_accounts._simpleSchema)

if Meteor.isServer
    
    crypto = Npm.require('crypto');
    
    MailDecrypt = (iv) ->
        @IV = iv || '-mail-2016fzb2e8'
    
    
    MailDecrypt::decrypt = (passwordHash, email) ->
        key32 = ""
        len = email.length
        if len < 32
            c = ""
            i = 0
            m = 32 - len
            while i < m
                c = " " + c
                i++
            key32 = email + c
        else if len >= 32
            key32 = email.slice(0, 32)
        
        decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(key32, 'utf8'), new Buffer(@IV, 'utf8'))
        
        decipherMsg = Buffer.concat([decipher.update(passwordHash, 'base64'), decipher.final()])
        
        password = decipherMsg.toString();
        return password;
    
    
    MailDecrypt::encrypt = (password, email) ->
        key32 = ""
        len = email.length
        if len < 32
            c = ""
            i = 0
            m = 32 - len
            while i < m
                c = " " + c
                i++
            key32 = email + c
        else if len >= 32
            key32 = email.slice(0, 32)
        
        cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(key32, 'utf8'), new Buffer(@IV, 'utf8'))
        
        cipheredMsg = Buffer.concat([cipher.update(new Buffer(password, 'utf8')), cipher.final()])
        
        passwordHash = cipheredMsg.toString('base64')
        
        return passwordHash;
    
    _IV = "-mail-2016fzb2e8";
    
    mailDecrypt = new MailDecrypt(_IV);
    
    db.mail_accounts.before.insert (userId, doc) ->
        doc.created_by = userId;
        doc.created = new Date();
        doc.modified_by = userId;
        doc.modified = new Date();
        
        if doc.password
            doc.password = mailDecrypt.encrypt(doc.password, doc.email);
    
    db.mail_accounts.before.update (userId, doc, fieldNames, modifier, options) ->
        email = doc.email;
        modifier.$set.modified_by = userId;
        modifier.$set.modified = new Date();
        
        if modifier.$set.email
            email = modifier.$set.email
        
        if modifier.$set.password
            modifier.$set.password = mailDecrypt.encrypt(modifier.$set.password, email);
    
    db.mail_accounts.after.findOne (userId, selector, options, doc)->
        if doc?.password
            doc.password = mailDecrypt.decrypt(doc.password, doc.email)

# db.mail_accounts.after.find (userId, selector, options, cursor)->
# 	cursor.forEach (item) ->
# 		item.password = mailDecrypt.decrypt(item.password, item.email)