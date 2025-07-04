import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __dirname = path.resolve(); // needed for ES module

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1️⃣ Serve tracking pixel
app.get('/track/open', async (req, res) => {
  const { email, uid } = req.query;

  await supabase
    .from('email_tracking')
    .insert({
      type: 'open',
      email,
      uid,
      ip: req.ip,
      user_agent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

  res.sendFile(path.join(__dirname, 'pixel.png'));
});

// 2️⃣ Click tracking + redirect
app.get('/track/click', async (req, res) => {
  const { email, uid, redirect } = req.query;

  await supabase
    .from('email_tracking')
    .insert({
      type: 'click',
      email,
      uid,
      ip: req.ip,
      user_agent: req.get('User-Agent'),
      redirect_url: redirect,
      timestamp: new Date().toISOString()
    });

  res.redirect(redirect);
});

// 3️⃣ Optional: view logs (test only!)
app.get('/logs', async (req, res) => {
  const { data, error } = await supabase.from('email_tracking').select('*');
  if (error) return res.json({ error });
  res.json(data);
});

app.listen(port, () => {
  console.log(`🚀 Tracker running on http://localhost:${port}`);
});
