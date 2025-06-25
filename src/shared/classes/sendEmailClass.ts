import {iSendEmailClass} from "../interfaces/iSendEmailClass";

class sendEmailClass implements iSendEmailClass {
    mailForm: string;
    mailTo: string;
    template: string;
    subject: string;
    stringMapping: any;
    constructor(mailForm: string, mailTo: string, template: string, subject: string, stringMapping: any) {
        this.mailForm = mailForm;
        this.mailTo = mailTo;
        this.template = template;
        this.subject = subject;
        this.stringMapping = stringMapping;
    }
  
}

module.exports = sendEmailClass;