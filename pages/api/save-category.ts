
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { category } = req.body;
    const filePath = path.join(process.cwd(), 'data.json');
    const fileData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : { items: [], categories: [] };
    fileData.categories.push(category);
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    res.status(200).json({ message: 'Category saved successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}