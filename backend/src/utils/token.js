import jwt from "jsonwebtoken";
export function signUser(user){
  return jwt.sign({id:user.id,email:user.email,role:user.role,name:user.name},process.env.JWT_SECRET,{expiresIn:"7d"});
}
