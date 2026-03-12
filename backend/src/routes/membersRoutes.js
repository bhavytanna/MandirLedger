const express = require('express');
const membersController = require('../controllers/membersController');
const { requireEditor } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireEditor, membersController.createMember);
router.get('/', membersController.listMembers);
router.get('/:memberId', membersController.getMember);
router.put('/:memberId', requireEditor, membersController.updateMember);
router.post('/:memberId/archive', requireEditor, membersController.archiveMember);
router.delete('/:memberId', requireEditor, membersController.deleteMember);

module.exports = router;
