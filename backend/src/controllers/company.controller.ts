import { Request, Response } from 'express';
import Company from '../models/Company';

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, contactPhone, address, gstNumber } = req.body;

    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company with this name already exists' });
    }

    const company = new Company({
      name,
      contactPerson,
      contactPhone,
      address,
      gstNumber
    });

    await company.save();
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Error creating company', error: (error as Error).message });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({ isActive: true });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: (error as Error).message });
  }
};
