
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'data.json');
    const fileData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : { items: [], categories: [] };
    res.status(200).json({ categories: fileData.categories });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}