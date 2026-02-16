const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require('mongoose');
const crypto = require('crypto');


// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  console.log("🔥 BODY RECEIVED:", req.body)
  console.log("🔥 USER:", req.user)

  const { courses } = req.body
  const userId = req.user.id

  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid course Id",
    })
  }

  const course_id = courses[0] // single-course checkout

  let course
  try {
    course = await Course.findById(course_id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Could not find the course",
      })
    }

    const uid = new mongoose.Types.ObjectId(userId)
    if (course.studentsEnrolled?.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "Student already enrolled",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }

  const options = {
    amount: course.price * 100,
    currency: "INR",
    receipt: Date.now().toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  }

  try {
    const paymentResponse = await instance.orders.create(options)

    return res.status(200).json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not initiate order",
    })
  }
}


// Verify Payment (called from frontend after successful payment)
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses } = req.body
    const userId = req.user.id

    console.log("🔍 VERIFY PAYMENT REQUEST:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courses,
      userId
    })

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed - missing required fields"
      })
    }

    // Verify signature
    const crypto = require('crypto')
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed - invalid signature"
      })
    }

    console.log("✅ Signature verified successfully")

    // Enroll student in courses
    for (const courseId of courses) {
      try {
        // Add student to course
        const enrolledCourse = await Course.findByIdAndUpdate(
          courseId,
          { $push: { studentsEnrolled: userId } },
          { new: true }
        )

        if (!enrolledCourse) {
          return res.status(404).json({
            success: false,
            message: "Course not found"
          })
        }

        // Add course to student's enrolled courses
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          { $push: { courses: courseId } },
          { new: true }
        )

        // Send enrollment email
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled in ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )

        console.log("Email sent:", emailResponse)
      } catch (error) {
        console.log("Error enrolling in course:", error)
        return res.status(500).json({
          success: false,
          message: error.message
        })
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and student enrolled successfully"
    })

  } catch (error) {
    console.log("VERIFY PAYMENT ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    })
  }
}

//lot of code missing sendPaymentSuccessEmail

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnroled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}