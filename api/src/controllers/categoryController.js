const { Category } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Check if category name already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category name already exists',
    });
  }

  // Create category
  const category = await Category.create({
    name,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: {
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    },
  });
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getAllCategories = asyncHandler(async (req, res) => {
  const { search, sort_by = 'createdAt', sort_order = 'desc' } = req.query;

  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sort_by] = sort_order === 'desc' ? -1 : 1;

  // Get all categories
  const categories = await Category.find(query).sort(sortOptions);

  res.json({
    success: true,
    data: {
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
    },
  });
});


// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Find category
  const category = await Category.findOne({ id: parseInt(req.params.id) });
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  // Check if name is being changed and if it's already taken
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name, id: { $ne: parseInt(req.params.id) } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists',
      });
    }
  }

  // Update fields
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;

  const updatedCategory = await category.save();

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: {
      category: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        description: updatedCategory.description,
        createdAt: updatedCategory.createdAt,
        updatedAt: updatedCategory.updatedAt,
      },
    },
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ id: parseInt(req.params.id) });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found',
    });
  }

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
