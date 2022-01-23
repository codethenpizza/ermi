import {NotificationService} from "@core/services/notification/NotificationService";
import {MailData, SMSData} from "@core/services/notification/types";
import {Transaction} from "sequelize";

export class NotificationServiceMock extends NotificationService {

    constructor() {
        super(null, null);
    }

    async sendMail(userID: number, data: MailData, transaction?: Transaction): Promise<boolean> {
        return true;
    }

    async sendSms(userID: number, data: SMSData): Promise<boolean> {
        return true;
    }

}
