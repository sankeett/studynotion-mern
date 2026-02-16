const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async(req,res) => {
    try {
        //data fetch
        const{sectionName, courseId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section objectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push: {
                                                    courseContent: newSection._id,
                                                }
                                            },
                                            {new: true},
                                        )
                                        .populate({
				                                path: "courseContent",
				                                populate: {
					                                        path: "subSection",
				                                },
			                            })
			                            .exec();

        //use populate to replace sections/subsections both in the updatedCourseDetails
        //return resonse
        return res.status(200).json({
            success: true,
            message: 'Section created successfully',
            updatedCourse: updatedCourseDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to create Section, please try again',
            error: error.message,
        })
    }
}

exports.updateSection = async(req,res) => {
    try {
        //fetch data
        const {sectionName, sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success: false,
                message: 'section missing',
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});
        //return response
        return res.status(200).json({
            success: true,
            message: 'Section updated successfully',
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update section, please try again',
            error: error.message,
        });
    }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    // delete section
    await Section.findByIdAndDelete(sectionId);

    // remove section reference from course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: {
          courseContent: sectionId,
        },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });

    return res.status(200).json({
      success: true,
      updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete section",
      error: error.message,
    });
  }
};
