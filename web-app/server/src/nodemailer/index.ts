import config from "../config";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    ...config.hosts.postfix,
    ignoreTLS: true,
    from: `Desbordante Enjoyer <${config.postfix.email}>`,
});
