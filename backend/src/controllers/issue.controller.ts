import { Request, Response } from 'express';
import Issue from '../models/Issue';

export const createIssue = async (req: Request, res: Response) => {
  try {
    const { driverId, description, category } = req.body;
    let photoUrl = '';

    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const newIssue = new Issue({
      driverId,
      description,
      category,
      photoUrl
    });

    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Server error while creating issue' });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  try {
    const issues = await Issue.find().populate('driverId', 'fullName phone').sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching issues' });
  }
};

export const resolveIssue = async (req: Request, res: Response) => {
  try {
    const issueId = req.params.id;
    const issue = await Issue.findByIdAndUpdate(issueId, { status: 'RESOLVED' }, { new: true });
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error resolving issue' });
  }
};
