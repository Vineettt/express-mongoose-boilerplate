import { iSendEmailClass } from "../interfaces/iSendEmailClass";
import config from "../../config/index";
const { prompts } = config();

import nodemailer from "nodemailer";
import AWS from "aws-sdk";
import * as handlebars from "handlebars";

const logger = require("@/shared/common/logger");
const commonMapping = require("@/shared/constants/common-mapping");

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "YES" || false;
const EMAIL_HANDLER = process.env.EMAIL_HANDLER;
const lang = process.env.ENV_LANG || "eu";

const SES_CONFIG = {
  apiVersion: process.env.APIVERSION,
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: process.env.REGION,
};

const ses = new AWS.SES(SES_CONFIG);

const transporter = nodemailer.createTransport({
  host: process.env.SMTPHOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD,
  },
});



const sendMail = async (payload: iSendEmailClass) => {
  try {
    if (!EMAIL_HANDLER) {
      logger.warn(prompts[lang]["ENV_EMAIL_HANDLER_NOT_ADDED"]);
    }
    if (EMAIL_ENABLED && EMAIL_HANDLER) {
      const templatePath = `${__dirname}/templates/${payload.template}.hbs`;
      const template = require("fs").readFileSync(templatePath, "utf-8");
      const compiledTemplate: handlebars.TemplateDelegate =
        handlebars.compile(template);
      const htmlContent = compiledTemplate(payload.stringMapping);
      if (commonMapping["AWS"] === EMAIL_HANDLER) {
        const params = {
          Destination: {
            ToAddresses: [payload.mailTo],
          },
          Message: {
            Body: {
              Html: {
                Charset: "UTF-8",
                Data: htmlContent,
              },
            },
            Subject: {
              Charset: "UTF-8",
              Data: payload.subject,
            },
          },
          Source:  payload.mailForm,
        };
        await ses.sendEmail(params).promise();
      }
      if (commonMapping["NODE_MAILER"] === EMAIL_HANDLER) {
        const mailOptions = {
          from: payload.mailForm,
          to: payload.mailTo,
          subject: payload.subject,
          html: htmlContent,
        };
        await transporter.sendMail(mailOptions);
      }
      logger.info(prompts[lang]["MAIL_SEND"]);
    } else {
      logger.warn(prompts[lang]["ENV_EMAIL_DISABLED"]);
    }
  } catch (error) {
    logger.error(`MAIL : ${error}`);
  }
};

module.exports = sendMail;
