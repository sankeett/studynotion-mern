const Category = require('../models/Category');

//create category ka handler function

exports.createCategory = async (req,res) => {
    try {
        //fetch data
        const {name,description} = req.body;

        //validation
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            })
        }

        //create an entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log(categoryDetails);

        //return response
        return res.status(200).json({
            success: true,
            message: 'Category created successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//getAllCategory handler function
exports.showAllCategories = async(req,res) => {
    try {
        const allCategories = await Category.find({}, {name: true, description: true})
        
        
        res.status(200).json({
            success: true,
            message: 'All Categories returned successfully',
            data: allCategories,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//category page details
exports.categoryPageDetails = async(req,res) => {
    try {
        //get category id
        const {categoryId} = req.body;
        //get courses for specified category id
        const selectedCategory = await Category.findById(categoryId)
                                                .populate("courses")
                                                .exec();
        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success: false,
                message: 'Data not found',
            });
        }
        //get courses for different categories
        const differentCategories = await Category.find({
            _id: {$ne: categoryId},
        }) 
        .populate("courses")
        .exec();
        //get top selling courses
        //HW -> figure out topo selling courses
        //return response

        const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)

        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                mostSellingCourses,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}