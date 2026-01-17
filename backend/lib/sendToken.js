const jsonWebToken = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

module.exports.sendToken = async (res, userId, statusCode, email, type) => {
  if(type !== "verify-email" && type !== "reset-password"){
    throw new Error("Invalid token type");
  }
  const isVerified = await prisma.user.findUnique({
    where: { id: userId },
    select: { isVerified: true },
  });

  const existingToken = await prisma.userTokens.findUnique({
    where: {
      userId: userId,
    }})

  if (existingToken) {
    await prisma.userTokens.delete({
      where: { userId: userId },
    });
  }
  if(type === "reset-password"){
    if (!isVerified || !isVerified.isVerified) {
      return res
        .status(400)
        .json({ error: "Email not verified. Cannot reset password." });
    }
    
  }else if(type === "verify-email"){
    if (isVerified && isVerified.isVerified) {
      return res
        .status(400)
        .json({ error: "Email already verified." });
    }
  }
  const token = jsonWebToken.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const hashedToken = bcrypt.hashSync(token, 10);
  await prisma.userTokens.create({
    data: {
      userId: userId,
      emailVerificationToken: type === "verify-email" ? hashedToken : null,
      passwordResetToken: type === "reset-password" ? hashedToken : null,
      emailVerificationExpiry: type === "verify-email" ? new Date(Date.now() + 3600000) : null,
      passwordResetExpiry: type === "reset-password" ? new Date(Date.now() + 3600000) : null,
    },
  });
  const nodemailerTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const actionLabel = type === "verify-email" ? "Verify Email" : "Reset Password";
  const actionUrl = `${process.env.FRONTEND_URL}/${type}?token=${token}`;
  const subject =
    type === "verify-email"
      ? "Welcome to ConnectVerse! Confirm your email"
      : "ConnectVerse password reset";
  const text =
    type === "verify-email"
      ? `Welcome to ConnectVerse!\n\nThanks for signing up. Please confirm your email to get started:\n${actionUrl}\n\nIf you didn’t create this account, you can ignore this email.`
      : `We received a request to reset your ConnectVerse password.\n\nReset your password here:\n${actionUrl}\n\nIf you didn’t request this, you can ignore this email.`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  };
  nodemailerTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
  res.status(statusCode).json({
    success: true,
    message: "Token sent to email for verification",
  });
};
