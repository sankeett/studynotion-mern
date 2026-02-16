const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require("otp-generator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Profile = require("../models/Profile");
const {passwordUpdated} = require('../mail/templates/passwordUpdate');
const mailSender = require('../utils/mailSender');
const otpTemplate = require('../../server/mail/templates/emailVerificationTemplate')
require("dotenv").config();



//send otp
exports.sendOTP = async (req,res) => {
    try {
        //fetch email from request ki body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //if user already exists then return a response
        if(checkUserPresent){
        return res.status(401).json({
            success: false,
            message: 'User already registered!',
        })
    }

    //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("OTP Generated: ", otp);

        //check unique otp or not
        let result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({otp: otp}); 
        }

        const otpPayload = {email,otp};

        //create an entry for otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        await mailSender(
                    email,
                    "Your StudyNotion verification code",
                    otpTemplate(otp)
                );

        res.status(200).json({
            success :true,
            message: 'OTP sent succussfully!',
        })



    }
     catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//sign up
exports.signUp = async (req,res) => {
  try {
       //fetch data from request ki body
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
    } = req.body;

    //validate the data
    if(!firstName || !lastName || !email || !password || !confirmPassword
        || !otp){
            return res.status(403).json({
                success: false,
                message: 'All fields are required'
            })
        }

    // match the 2 passwords
    if(password !== confirmPassword){
        return res.status(400).json({
            success: false,
            message: 'Password and confirm Password value does not match, please try again'
        });
    }

    //check if user already exists or not
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success: false,
            message: 'User is already registered',
        });
    }

    //find most recent otp stored for the user
    const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
    console.log(recentOtp); 

    //validate otp
    if(recentOtp.length === 0){
        return res.status(400).json({
            success: false,
            message: 'OTP not found'
        })
    } else if(otp !== recentOtp[0].otp){
        return res.status(400).json({
            success: false,
            message: "Invalid OTP",
        });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    //create entry in db

    const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    //return response
    return res.status(200).json({
        success: true,
        message: 'User is registered successfully',
        user,
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
        success: false,
        message: 'User cannot be registered, please try again'
    })
  }
}

//login
exports.login = async (req,res) => {
    try {
        //get data from request ki body
        const{email,password} = req.body;
        //validate the data
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: 'All fields are required, please try again',
            });
        }
        //check if user exists or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'user is not registered, please signup first'
            });
        }
        //generate jwt, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn: "2h",
        });
        user.token = token;
        user.password = undefined;

        // create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: 'Logged in successfully'
        })

        } else{
            return res.status(401).json({
                success: false,
                message: 'password is incorrect',
            });
        }
        


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login failure, please try again',
        });
    }
};

//change password
exports.changePassword = async(req,res) => {
    try {
        //get data from req body
        const userDetails = await User.findById(req.user.id);
        //get old password, new password, confirm new password
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        //validate old password
        const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
        );
        if(!isPasswordMatch){
        return res.status(401).json({
            success: false,
            message: "The password is incorrect"
        });
        }
        //match new password and confirm new password
        if(newPassword !== confirmNewPassword){
        return res.status(400).json({
            success: false,
            message: "The password and confirm password does not match",
        });
        }
        //update password in db
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        {password: encryptedPassword},
        {new: true}
        );

        //send mail password updated
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    passwordUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("email sent successfully: ", emailResponse.response);
        } catch (error) {
            console.error("Error occured while sending email: ", error);
            return res.status(500).json({
                success: false,
                message: "Error occured while sending email",
                error: error.message,
            });
        }
        //return response
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        })
    } catch (error) {
        console.error("Error occured while updating password: ", error);
        return res.status(500).json({
            success: false,
            message: "Error occured while updating password",
            error: error.message,
        });
    }
};