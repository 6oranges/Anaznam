import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from 'uuid';
import cookieParser from "cookie-parser"
dotenv.config();

const client = new PrismaClient();
const app = express();
const path = require('path')
app.use(express.static(path.join(__dirname, 'www')))
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
  allowedHeaders:"Content-Type"
}));

type CreateUserBody = {
  firstName: string,
  lastName: string,
  email: string,
  password: string
};

app.post("/users", async (req,res) =>{
  const {firstName,lastName,email,password} = req.body as CreateUserBody;  
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await client.user.create({
    data:{
      firstName,
      lastName,
      email,
      passwordHash,
      sessions: {
        create: [{
          token: uuidv4()
        }]
      }
    },
    include:{
      sessions: true
    }
  });
  res.cookie("session-token", user.sessions[0].token, {
    httpOnly: true
  });
  res.json({ user })
})
type LoginBody = {
  email: string,
  password: string
}
app.post("/sessions", async (req, res) => {
  const {email, password} = req.body as LoginBody
  const user = await client.user.findFirst({
    where: {
      email
    }
  });
  if (!user) {
    res.status(404).json({message: "Invalid email or password"});
    return;
  };
  const isValid = await bcrypt.compare(password, user.passwordHash)
  if(!isValid) {
    res.status(404).json({message: "Invalid email or password"})
    return;
  };

  const token = uuidv4();
  const session = await client.session.create({
    data: {
      userId: user.id,
      token
    }
  });

  res.cookie("session-token", session.token, {
    httpOnly: true,
  });

  res.json({ user })
})

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});