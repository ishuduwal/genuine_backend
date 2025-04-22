import express from 'express';
import {
    createTeacher,
    getTeachers,
    getTeachersByDepartment,
    getTeacher,
    updateTeacher,
    deleteTeacher
} from '../controller/Teacher.js';

const teacherRouter = express.Router();

teacherRouter.post('/', createTeacher);
teacherRouter.get('/', getTeachers);
teacherRouter.get('/department/:departmentId', getTeachersByDepartment);
teacherRouter.get('/:id', getTeacher);
teacherRouter.put('/:id', updateTeacher);
teacherRouter.delete('/:id', deleteTeacher);

export default teacherRouter;