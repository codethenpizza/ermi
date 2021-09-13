import {MailService} from "@core/services/notification/MailService";
import {SMSService} from "@core/services/notification/SMSService";
import {MailData, SMSData} from "@core/services/notification/types";
import {Transaction} from "sequelize";

export class NotificationService {

    constructor(
        private mailService: MailService = new MailService(),
        private smsService: SMSService = new SMSService()
    ) {
    }

    sendMail(userID: number, data: MailData, transaction?: Transaction): Promise<boolean> {
        return this.mailService.sendMail(userID, data, transaction);
    }

    sendSms(userID: number, data: SMSData): Promise<boolean> {
        return this.smsService.sendSms(userID, data);
    }

}
