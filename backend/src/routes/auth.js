import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { signUser } from "../utils/token.js";
import { requireAuth } from "../middleware/auth.js";
const router=express.Router();
router.post("/register",(req,res)=>{
  const {name,email,password,role="customer"}=req.body;
  if(!name||!email||!password)return res.status(400).json({error:"Missing required fields"});
  const existing=db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if(existing)return res.status(409).json({error:"Email already in use"});
  const hash=bcrypt.hashSync(password,10);
  const result=db.prepare("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)").run(name,email,hash,role);
  if(role==="customer") db.prepare("INSERT INTO customers (user_id) VALUES (?)").run(result.lastInsertRowid);
  const user=db.prepare("SELECT id,name,email,role FROM users WHERE id=?").get(result.lastInsertRowid);
  res.json({token:signUser(user),user});
});
router.post("/login",(req,res)=>{
  const {email,password}=req.body;
  const user=db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if(!user)return res.status(401).json({error:"Invalid credentials"});
  if(!bcrypt.compareSync(password,user.password_hash))return res.status(401).json({error:"Invalid credentials"});
  const safeUser={id:user.id,name:user.name,email:user.email,role:user.role};
  res.json({token:signUser(safeUser),user:safeUser});
});
router.get("/me",requireAuth,(req,res)=>{
  const user=db.prepare("SELECT id,name,email,role FROM users WHERE id=?").get(req.user.id);
  res.json({user});
});
export default router;
