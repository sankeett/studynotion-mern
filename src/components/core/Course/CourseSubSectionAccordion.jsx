import React from "react"
import { HiOutlineVideoCamera } from "react-icons/hi"

function CourseSubSectionAccordion({ subSec }) {
  return (
    <div className="flex items-center justify-between rounded-md px-4 py-3 text-sm transition-all duration-200 hover:bg-richblack-700">
      
      {/* Left side */}
      <div className="flex items-center gap-3 text-richblack-25">
        <HiOutlineVideoCamera className="text-lg text-richblack-300" />
        <p className="font-medium">{subSec?.title}</p>
      </div>

      {/* Right side (duration) */}
      <p className="text-xs text-richblack-300">
        {subSec?.timeDuration || "00:00"}
      </p>
    </div>
  )
}

export default CourseSubSectionAccordion
