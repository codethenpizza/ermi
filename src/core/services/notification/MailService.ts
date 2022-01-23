import {createTransport, Transporter} from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import config from "config";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {Transaction} from "sequelize";

import {MailData} from "@core/services/notification/types";
import User from "@core/models/User.model";
import {cacheService} from "@core/services";
import ReadableStream = NodeJS.ReadableStream;


export class MailService {

    private transporter?: Transporter<SMTPTransport.SentMessageInfo>;

    constructor(
        private _cacheService = cacheService
    ) {
    }

    async sendMail(userID: number, data: MailData, transaction?: Transaction): Promise<boolean> {
        try {
            const user = await User.findByPk(userID, {transaction});

            const transport = await this.getTransporter();

            const actionInfo = await transport.sendMail({
                from: '"4WHEELS" <no_reply@four-wheels.ru>',
                to: user.email,
                subject: data.subject,
                text: data.body
            });

            if (actionInfo.accepted.includes(user.email)) {
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

    async getDKIMPrivateKey(): Promise<string> {
        const DKIMCacheKey = '4wheels-DKIM';

        const cachedData = await this._cacheService.get(DKIMCacheKey);

        if (cachedData) {
            return cachedData;
        }

        const {credentials, DKIM: {region, Bucket, Key}} = config.AWS;

        const s3Client = new S3Client({
            region,
            credentials
        });

        const obj = await s3Client.send(new GetObjectCommand({Bucket, Key, ResponseContentType: 'string'}));
        const data = await new Promise<string>(((resolve) => {
            let str = '';
            (obj.Body as ReadableStream).on('readable', () => {
                let tmp;
                // @ts-ignore
                while (null !== (tmp = obj.Body.read())) {
                    str += tmp.toString();
                }
            }).on('end', () => {
                resolve(str);
            });
        }));

        await this._cacheService.set(DKIMCacheKey, data);

        return data;
    }

    private async getTransporter(): Promise<Transporter<SMTPTransport.SentMessageInfo>> {
        if (!this.transporter) {
            await this.initTransporter();
        }
        return this.transporter;
    }

    private async initTransporter(): Promise<void> {
        const {host, port, auth, dkim} = config?.mail?.smtp || {};

        const privateKey = await this.getDKIMPrivateKey();

        this.transporter = createTransport({
            host,
            port,
            secure: true,
            auth,
            dkim: {
                domainName: dkim.domainName,
                keySelector: dkim.keySelector,
                privateKey
            }
        });
    }
}
