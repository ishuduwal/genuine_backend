import express from 'express';
import { createMessage, getMessages, markAsRead, deleteMessage } from '../controller/Message.js';

const messageRouter = express.Router();

messageRouter.post('/', createMessage);
messageRouter.get('/', getMessages);
messageRouter.patch('/:id/read', markAsRead);
messageRouter.delete('/:id', deleteMessage);

export default messageRouter;