import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const newItem = req.body;
    const filePath = path.join(process.cwd(), 'data.json');
    const fileData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : { items: [], categories: [] };
    fileData.items.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    res.status(200).json({ message: 'Item saved successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}