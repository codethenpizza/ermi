import {createTransport, Transporter} from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import config from "config";

import {MailData} from "@core/services/notification/types";
import User from "@models/User.model";
import {Transaction} from "sequelize";

export class MailService {

    private transporter?: Transporter<SMTPTransport.SentMessageInfo>;

    async sendMail(userID: number, data: MailData, transaction?: Transaction): Promise<boolean> {
        try {
            const user = await User.findByPk(userID, {transaction});

            const transport = this.getTransporter();

            const actionInfo = await transport.sendMail({
                from: '"4WHEELS" <no_reply@four-wheels.ru>',
                to: user.email,
                // to: 'fitality1@gmail.com',
                subject: data.subject,
                text: data.body
            });

            if (actionInfo.accepted.includes('fitality1@gmail.com')) {
                return true;
            } else {
                console.error('Send mail error: ', JSON.stringify(actionInfo));
                return false;
            }
        } catch (e) {
            console.error('Send mail error: ', e.message);
            return false;
        }
    }

    private getTransporter(): Transporter<SMTPTransport.SentMessageInfo> {
        if (!this.transporter) {
            this.initTransporter();
        }
        return this.transporter;
    }

    private initTransporter(): void {
        const {host, port, auth, dkim} = config?.mail?.smtp || {};
        this.transporter = createTransport({
            host,
            port,
            secure: true,
            auth,
            dkim
        });
    }

}
