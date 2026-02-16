const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
  try {
    let token = null

    // 1️⃣ From cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    // 2️⃣ From body
    else if (req.body && req.body.token) {
      token = req.body.token
    }

    // 3️⃣ From Authorization header
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]
      }
    }

    // ❌ No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      })
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded

    next()
  } catch (error) {
    console.error("AUTH ERROR:", error.message)
    return res.status(401).json({
      success: false,
      message: "Token is invalid",
    })
  }
}


//isStudent
exports.isStudent = async(req,res,next) => {
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for students only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again',
        });
    }
}

//isInstructor
exports.isInstructor = async(req,res,next) => {
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for instructors only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}

//isAdmin
exports.isAdmin = async(req,res,next) => {
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Admin only',
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}