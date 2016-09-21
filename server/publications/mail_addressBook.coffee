Meteor.publish 'mail_addressBook', ()->
  
    return db.mail_addressBook.find()