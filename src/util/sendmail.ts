import nodemailer from "nodemailer";
import { ApiResponse } from "../types/ApiResponse";
const Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,

  service: "yashpawar12122004@gmail.com",
  auth: {
    user: "yashpawar12122004@gmail.com",

    pass: "nwxb yuwl uioz dzkc",
  },
});
const sendVerificationMail = async (
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponse> => {
  try {
    const MailOptions = {
      from: "yashpawar12122004@gmail.com",
      to: email,
      subject: "Procoders verification code",
      text: `your verification code is ${verifyCode} for username :${username}`,
    };
    const response = await Transporter.sendMail(MailOptions);
    console.log("this is a mail response:", response);
    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.log("Error in sending email");
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
};
export const sendResetPasswordMail = async function (
  ResetLink: string,
  email: string
): Promise<ApiResponse> {
  const resetUrl = `http://localhost:5173/Reset-password/${ResetLink}`;

  const MailOptions = {
    from: "yashpawar12122004@gmail.com",
    to: email,
    subject: "Password Reset",
    html: `
            <h3>Password Reset</h3>
            <p>You have requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `,
  };
  try {
    const response = await Transporter.sendMail(MailOptions);
    console.log("this a email response :", response);

    return {
      success: true,
      message: "Reset password mail sent sucessfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error in sending forgot password mail",
    };
  }
};
export default sendVerificationMail;
