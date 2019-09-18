const nodeMailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

const transporter = nodeMailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const createHtml = (filename, options) => {
  const html = pug.renderFile(
    `${__dirname}/../views/email/${filename}.pug`,
    options
  );
  return html;
};

exports.send = async (options) => {
  const html = createHtml(options.filename, options);
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: "Paulius <noreply@PauliusMa.com",
    to: options.user.email,
    subject: options.subject,
    text,
    html
  };

  return transporter.sendMail( mailOptions);
};
