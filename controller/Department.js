import Department from '../model/Department.js';

// Create new department
export const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Check if department already exists
        const departmentExists = await Department.findOne({ name });
        if (departmentExists) {
            return res.status(400).json({ message: 'Department already exists' });
        }
        
        const department = new Department({
            name,
            description
        });
        
        await department.save();
        res.status(201).json(department);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all departments
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single department
export const getDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update department
export const updateDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Check if updated name already exists for another department
        if (name) {
            const existingDept = await Department.findOne({ 
                name, 
                _id: { $ne: req.params.id } 
            });
            
            if (existingDept) {
                return res.status(400).json({ message: 'Department name already exists' });
            }
        }
        
        const updatedDepartment = await Department.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        
        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.status(200).json(updatedDepartment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete department
export const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        await Department.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};