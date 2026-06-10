import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createIssue, getIssues, resolveIssue } from '../controllers/issue.controller';

const router = Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('photo'), createIssue);
router.get('/', getIssues);
router.put('/:id/resolve', resolveIssue);

export default router;
