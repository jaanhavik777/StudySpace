const express = require('express');
const auth = require('../middleware/auth');
const StudySession = require('../models/StudySession');
const router = express.Router();

router.post('/', auth, async (req,res)=>{
  try{
    const {title, description, link} = req.body;
    if(!title) return res.status(400).json({message:'Missing title'});
    const s = await StudySession.create({title, description:description||'', link:link||'', hostEmail:req.user.email});
    res.json(s);
  }catch(e){ res.status(500).json({message:'err'}); }
});

router.get('/', async (req,res)=>{
  try{ const list = await StudySession.find().sort({createdAt:-1}).lean(); res.json(list); }catch(e){ res.status(500).json({}); }
});

router.get('/:id', async (req,res)=>{
  try{ const s = await StudySession.findById(req.params.id).lean(); if(!s) return res.status(404).json({message:'Not found'}); res.json(s); }catch(e){ res.status(500).json({}); }
});

router.put('/:id/notes', auth, async (req,res)=>{
  try{ const s = await StudySession.findById(req.params.id); if(!s) return res.status(404).json({message:'Not found'}); s.notes = req.body.notes || ''; await s.save(); res.json({ok:true, notes:s.notes}); }catch(e){ res.status(500).json({}); }
});

module.exports = router;
