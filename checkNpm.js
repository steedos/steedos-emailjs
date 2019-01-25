import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions({
    "busboy": "^0.2.13",
    "cookies": "^0.6.1",
    "mime": "^1.3.4",
    "emailjs-mime-builder": "git://github.com/steedos/emailjs-mime-builder.git",
    "emailjs-mime-codec": "1.0.2",
    "emailjs-stringencoding": "1.0.1",
    "emailjs-mime-parser": "1.0.0",
    "emailjs-imap-client": "git://github.com/steedos/emailjs-imap-client.git",
    "emailjs-smtp-client": "1.0.0",
    "emailjs-tcp-socket": "git://github.com/steedos/emailjs-tcp-socket.git",
    "regenerator-runtime": "0.9.5"
}, 'steedos:emailjs');