import express from 'express';
import {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment
} from '../controller/Department.js';

const departmentRouter = express.Router();

departmentRouter.post('/', createDepartment);
departmentRouter.get('/', getDepartments);
departmentRouter.get('/:id', getDepartment);
departmentRouter.put('/:id', updateDepartment);
departmentRouter.delete('/:id', deleteDepartment);

export default departmentRouter;