import Teacher from '../model/Teacher.js';
import Department from '../model/Department.js';
import { v2 as cloudinary } from 'cloudinary';

// Create new teacher
export const createTeacher = async (req, res) => {
    try {
        const { name, contactNumber, department, image } = req.body;
        
        // Validate department exists
        const departmentExists = await Department.findById(department);
        if (!departmentExists) {
            return res.status(400).json({ message: 'Department not found' });
        }
        
        if (!image) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        // Upload image directly to Cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: 'school-teachers',
            resource_type: 'auto'
        });
        
        const teacher = new Teacher({
            name,
            contactNumber,
            department,
            image: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });
        
        await teacher.save();
        res.status(201).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all teachers
export const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .populate('department', 'name')
            .sort({ name: 1 });
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get teachers by department
export const getTeachersByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        const teachers = await Teacher.find({ department: departmentId })
            .populate('department', 'name')
            .sort({ name: 1 });
            
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single teacher
export const getTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .populate('department', 'name');
            
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        
        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update teacher
export const updateTeacher = async (req, res) => {
    try {
        const { name, contactNumber, department, image } = req.body;
        
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        
        // Validate department if provided
        if (department) {
            const departmentExists = await Department.findById(department);
            if (!departmentExists) {
                return res.status(400).json({ message: 'Department not found' });
            }
        }
        
        let imageData = teacher.image;
        
        // Update image if provided
        if (image && image !== teacher.image.url) {
            // Delete old image from Cloudinary
            await cloudinary.uploader.destroy(teacher.image.public_id);
            
            // Upload new image
            const result = await cloudinary.uploader.upload(image, {
                folder: 'school-teachers',
                resource_type: 'auto'
            });
            
            imageData = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }
        
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            {
                name: name || teacher.name,
                contactNumber: contactNumber || teacher.contactNumber,
                department: department || teacher.department,
                image: imageData
            },
            { new: true }
        ).populate('department', 'name');
        
        res.status(200).json(updatedTeacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        
        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(teacher.image.public_id);
        
        await Teacher.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};