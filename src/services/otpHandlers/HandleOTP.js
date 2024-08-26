const { Timekoto } = require("timekoto");
const OTP = require("../../models/Otp/OtpModel");
const { logger } = require("../logHandlers/HandleWinston");
const { sendPasswordResetOTPEmail } = require("../emailHandlers/HandleEmail");

//create a 4 digit OTP
const createOTP = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  logger.log("info", `A new OTP has been created`);
  return otp;
};

//save the otp to database
const saveOTP = async ({ email, otp }) => {
  const existingOtp = await OTP.findOne({ email });
  if (existingOtp) {
    const expiresAt = Timekoto() + 60 * 3; // 3 mins in seconds
    const updatedOtp = await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { new: true }
    );
    logger.log("info", `An existing OTP has been updated for: ${email}`);
    return updatedOtp;
  } else {
    const newOtp = await OTP.create({ email, otp });
    logger.log("info", `A new OTP has been saved for: ${email}`);
    return newOtp;
  }
};

//send the otp to the user
const sendOTP = async ({ email }) => {
  try {
    //validate inputs
    if (!email) {
      return { error: "Email is required" };
    }

    //create and save the otp
    const otp = createOTP();
    const savedOtp = await saveOTP({ email, otp });
    if (!savedOtp) {
      return { error: "Failed to send OTP" };
    }
    const code = otp;
    //send the email
    const status = await sendPasswordResetOTPEmail({ email, code });
    if (!status?.code === 200) {
      return { error: `${email} doesn't exist` };
    }
    logger.log("info", `Password reset OTP sent to: ${email}`);
    return { message: "Password reset OTP sent successfully" };
  } catch (error) {
    logger.log("error", error?.message);
    return { message: `Failed to reset ${email} password` };
  }
};

//match the otp
const matchOTP = async ({ email, otp }) => {
  const savedOtp = await OTP.findOne({ email: email });
  if (savedOtp?.otp === otp) {
    if (savedOtp?.expiresAt > Timekoto()) {
      return { isMatch: true, message: "OTP matched!" };
    } else {
      return { isMatch: false, message: "OTP expired!" };
    }
  } else {
    logger.log("info", `OTP did not match for: ${email}`);
    return { isMatch: false, message: "OTP did not match!" };
  }
};

//validate the otp
const validateOTP = async ({ email, otp }) => {
  try {
    //validate inputs
    if (!otp || !email) {
      return { error: "All fields are required" };
    }
    //match the otp
    const otpMatch = await matchOTP({ email, otp });
    if (!otpMatch?.isMatch) {
      logger.log("info", `OTP did not match for: ${email}`);
      return { error: otpMatch?.message };
    } else {
      logger.log("info", `OTP validated successfully for: ${email}`);
      return { message: otpMatch?.message };
    }
  } catch (error) {
    logger.log("error", error?.message);
    return { message: `Failed to reset ${email} password` };
  }
};

module.exports = { createOTP, saveOTP, sendOTP, matchOTP, validateOTP };
