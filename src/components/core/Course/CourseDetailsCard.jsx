import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { addToCart } from "../../../slices/cartSlice"
import { ACCOUNT_TYPE } from "../../../utils/constants"

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // ADD DEBUGGING
  console.log("📦 COURSE PROP IN CARD:", course)
  console.log("📦 IS ARRAY?", Array.isArray(course))

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  // ADD MORE DEBUGGING
  console.log("🖼️ THUMBNAIL:", ThumbnailImage)
  console.log("💰 PRICE:", CurrentPrice)
  console.log("🆔 COURSE ID:", courseId)

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }

    if (token) {
      console.log("➕ ADDING COURSE TO CART:", course) // ADD THIS
      console.log("➕ COURSE STRUCTURE:", {
        _id: course._id,
        courseName: course.courseName,
        thumbnail: course.thumbnail,
        price: course.price,
        category: course.category,
        instructor: course.instructor
      }) // ADD THIS
      dispatch(addToCart(course))
      return
    }

    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const isEnrolled = user && course?.studentsEnrolled?.includes(user?._id)

  return (
    <>
      <div className="flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5">
        {/* Course Image */}
        <img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
        />
        
        <div className="px-4">
          {/* Price */}
          <div className="space-x-3 pb-4 text-3xl font-semibold">
            Rs. {CurrentPrice}
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <button
              className="yellowButton"
              onClick={
                isEnrolled
                  ? () => navigate("/dashboard/enrolled-courses")
                  : handleBuyCourse
              }
            >
              {isEnrolled ? "Go To Course" : "Buy Now"}
            </button>
            
            {!isEnrolled && (
              <button onClick={handleAddToCart} className="blackButton">
                Add to Cart
              </button>
            )}
          </div>
          
          {/* Guarantee */}
          <div>
            <p className="pb-3 pt-6 text-center text-sm text-richblack-25">
              30-Day Money-Back Guarantee
            </p>
          </div>
          
          {/* Course Includes */}
          <div>
            <p className="my-2 text-xl font-semibold">
              This Course Includes :
            </p>
            <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
              {course?.instructions?.map((item, i) => {
                return (
                  <p className="flex gap-2" key={i}>
                    <BsFillCaretRightFill />
                    <span>{item}</span>
                  </p>
                )
              })}
            </div>
          </div>
          
          {/* Share */}
          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-yellow-100"
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseDetailsCard