import nodemailer from "nodemailer";
const Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  // service: process.env.SMPT_SERVICE,
  service: "yashpawar12122004@gmail.com",
  auth: {
    user: "yashpawar12122004@gmail.com",
    // user: process.env.SMPT_MAIL,
    pass: "nwxb yuwl uioz dzkc",
    // pass: 'yash1212204',
  },
});
export const sendForgotPasswordEmail = (email: string, resetToken: string) => {
  const resetUrl = `http://your-website.com/reset-password/${resetToken}`;

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Password Reset Request",
    html: `
            <h3>Password Reset</h3>
            <p>You have requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `,
  };

  // Send the email
  Transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email: ", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
