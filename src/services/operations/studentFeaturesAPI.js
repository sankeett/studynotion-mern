import { toast } from "react-hot-toast"

import rzpLogo from "../../assets/Logo/Logo-Full-Dark.png"
import { resetCart } from "../../slices/cartSlice"
import { setPaymentLoading } from "../../slices/courseSlice"
import { apiConnector } from "../apiconnector"
import { studentEndpoints } from "../apis"

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints

// Load the Razorpay SDK from the CDN
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

// Buy the Course
export async function BuyCourse(
  token,
  course_id,
  user_details,
  navigate,
  dispatch
) {
  
  const toastId = toast.loading("Loading...")
  try {
    console.log("🔑 RAZORPAY KEY:", process.env.REACT_APP_RAZORPAY_KEY) 
    console.log("🧪 COURSE_ID SENT TO BACKEND:", course_id)

    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
    if (!res) {
      toast.error("Razorpay SDK failed to load")
      return
    }

    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { courses: [course_id] }, // ✅ Changed from { course_id } to { courses: [course_id] }
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("🧾 PAYMENT RESPONSE:", orderResponse.data)

    if (!orderResponse?.data?.success) {
      throw new Error(orderResponse?.data?.message)
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: orderResponse.data.data.amount, // ✅ Changed from orderResponse.data.amount
      currency: orderResponse.data.data.currency, // ✅ Changed from orderResponse.data.currency
      order_id: orderResponse.data.data.id, // ✅ Changed from orderResponse.data.orderId
      name: "StudyNotion",
      description: "Thank you for purchasing the course",
      image: rzpLogo,
      prefill: {
        name: `${user_details.firstName} ${user_details.lastName}`,
        email: user_details.email,
      },
      handler: function (response) {
        verifyPayment(
          { ...response, courses: [course_id] }, // ✅ Also update here
          token,
          navigate,
          dispatch
        )
      },
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  } catch (error) {
    console.log("❌ PAYMENT API ERROR:", error)
    console.log("❌ ERROR RESPONSE:", error?.response?.data)
    toast.error(error?.response?.data?.message || "Payment failed")
  }
  toast.dismiss(toastId)
}





// Verify the Payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment...")
  dispatch(setPaymentLoading(true))
  try {
    console.log("🔍 VERIFY PAYMENT - BODY DATA:", bodyData) // ADD THIS
    console.log("🔍 VERIFY PAYMENT - TOKEN:", token ? "EXISTS" : "MISSING")
    const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    })

    console.log("VERIFY PAYMENT RESPONSE FROM BACKEND............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Payment Successful. You are Added to the course ")
    navigate("/dashboard/enrolled-courses")
    dispatch(resetCart())
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR............", error)
    toast.error("Could Not Verify Payment.")
  }
  toast.dismiss(toastId)
  dispatch(setPaymentLoading(false))
}

// Send the Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR............", error)
  }
}