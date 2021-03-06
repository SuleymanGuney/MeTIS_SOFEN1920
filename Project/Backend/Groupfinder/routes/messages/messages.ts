import express from 'express';
const router = express.Router();
import Message from '../../types/message';
import { MessageController } from './messages_methods';

let messagecontroller: MessageController = new MessageController();

/**
 * Middleware that is specific to this router
 */
router.use((req: any, res: any, next: Function) => {
    next()
});


/////////////////////////////////////////////////////////////////////////////////////
// Define routes
/////////////////////////////////////////////////////////////////////////////////////

/**
 * Get all messages sent between two users
 */
router.get('/conversation/:user_id1/:user_id2', async (req: any, res: any) => {
    const userID1: number = parseInt(req.params.user_id1);
    const userID2: number = parseInt(req.params.user_id2);
    try{
        const messages: Message[] = await messagecontroller.getConversation(userID1, userID2);
        res.status(200).json(messages);
    } catch (err) {
        const statusCode: number = parseInt(err);
        res.status(statusCode).send("Error while fetching conversation from the database.");
    }
});


/**
 * Get all users that have a conversation with a specific user (with user_id as id).
 */
router.get('/:user_id', async (req: any, res: any) => {
    const userID: number = parseInt(req.params.user_id);
    try{
        const userIDs: number[] = await messagecontroller.getCorrespondents(userID);
        res.status(200).json(userIDs);
    } catch (err) {
        const statusCode: number = parseInt(err);
        res.status(statusCode).send("Error while fetching correspondents from the database.");
    }
});


/**
 * Insert new message into the database.
 * @pre body of http request contains the new message (type: Message) in JSON format
 */
router.post('/', async (req: any, res: any) => {
    const msg: Message = req.body.message;
    try{
        const newMessageID: number = await messagecontroller.addMessage(msg);
        res.status(200).json({id: newMessageID});
    } catch (err) {
        const statusCode: number = parseInt(err);
        res.status(statusCode).send("Error while inserting new message into the database.");
    }
});

module.exports = router;