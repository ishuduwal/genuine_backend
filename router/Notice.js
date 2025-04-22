import express from 'express';
import {
  createNotice,
  getActiveNotices,
  getAllNotices,
  getNoticeById,
  updateNotice,
  toggleNoticeStatus,
  deleteNotice,
  getCurrentNotice
} from '../controller/Notice.js';

const noticeRouter = express.Router();

noticeRouter.route('/')
  .post(createNotice)  // Removed Multer middleware
  .get(getAllNotices);

noticeRouter.get('/active', getActiveNotices);
noticeRouter.get('/current', getCurrentNotice); // Added current notice route

noticeRouter.route('/:id')
  .get(getNoticeById)
  .put(updateNotice)  // Removed Multer middleware
  .delete(deleteNotice);

noticeRouter.put('/:id/toggle', toggleNoticeStatus);

export default noticeRouter;