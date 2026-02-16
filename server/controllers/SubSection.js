const SubSection = require('../models/SubSection');
const Section = require('../models/Section')
const { uploadImageToCloudinary } = require('../utils/imageUploader');


//create subsection
exports.createSubSection = async (req, res) => {
  try {
    console.log("BODY:", req.body)
    console.log("FILES:", req.files)
    console.log("FILES KEYS:", Object.keys(req.files || {}))

    // fetch data
    const { sectionId, title, description } = req.body

    // fetch file
    const video = req.files?.lectureVideo

    // validation
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // upload video
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    )

    // create subsection
    const subSectionDetails = await SubSection.create({
      title,
      description,
      videoUrl: uploadDetails.secure_url,
      timeDuration: uploadDetails.duration || "0",
    })

    // update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    ).populate("subSection")

    return res.status(200).json({
      success: true,
      data: updatedSection,
    })
  } catch (error) {
    console.error("CREATE SUBSECTION ERROR:", error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


//HW: update sub section
exports.updateSubSection = async(req,res) => {
    try {
        //fetch data
        const {sectionId, subSectionId, title, description} = req.body;
        const subSection = await SubSection.findById(subSectionId)
        //data validation
        if(!subSection){
            return res.status(404).json({
                success: false,
                message: "sub section not found",
            })
        }
        if(title !== undefined){
            subSection.title = title
        }
        if(description !== undefined){
            subSection.description = description
        }

        //update sub section
        if(req.files && req.files.video !== undefined){
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `{uploadDetails.duration}`
        }

        await subSection.save()
        //return response
        return res.json({
            success: true,
            message: 'Section updated successfully',
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'An error occured while updating the section'
        })
    }
};
//HW: delete sub section
exports.deleteSubSection = async(req,res) => {
    try {
        //fetch sub section id
        const{ subSectionId, sectionId } = req.body;
        //use findByIdAndDelete to delete the sub section
        await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $pull: {
                    subSection: subSectionId,
                }
            }
        )
        const subSection = await SubSection.findByIdAndDelete({_id: subSectionId})
        if(!subSection){
            return res.status(404).json({
                success: false,
                message: "Sub Section not found"
            })
        }
        // return response
        return res.json({
            success: true,
            message: "Sub Section deleted successfully"
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: 'An error occured while deleting the sub section',
        })
    }
};