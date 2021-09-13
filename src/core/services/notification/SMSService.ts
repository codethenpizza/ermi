import {SMSData} from "@core/services/notification/types";

export class SMSService {

    async sendSms(userID: number, data: SMSData): Promise<boolean> {
        console.log('Send SMS');
        return true;
    }

}
