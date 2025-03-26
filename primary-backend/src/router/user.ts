import {  Router } from "express";
import { authMidlleware } from "../middleware";
import { SigninSchema,SignupSchema } from "../types";
import jwt from "jsonwebtoken";
import { prismaClient } from "../db";
import { JWT_PASSWORD } from "../config";

const router=Router();

router.post("/signup",async(req,res)=>{
  const body=req.body;
  const parseddata=SignupSchema.safeParse(body);

  if(!parseddata.data){
    console.log(parseddata.error);
    return res.status(411).json({
        message:"Incorrest input"
    })
  }  

  const userexists= await prismaClient.user.findFirst({
    where:{
        email:parseddata.data.username
    }
  });
  if(userexists){
    return res.status(403).json({
        message:"user already eist"
    })
  }

  await prismaClient.user.create({
    data:{
        email:parseddata.data.username,
        password:parseddata.data.password,
        name:parseddata.data.name
    }
  })
  return res.json({
    message:"please verify your accout by your mail"
  });
})

router.post("/signin",async(req,res)=>{

    const body=req.body;
    const parseddata=SigninSchema.safeParse(body);

    if(!parseddata.success){
        return res.status(411).json({
            message:"Incorret input"
        })
    }

    const user=await prismaClient.user.findFirst({
        where:{
            email:parseddata.data.username,
            password:parseddata.data.password
        }
    })
    if(!user){
        return res.status(403).json({
            message:"cresdiantial are incorrect"
        })
    }

    const token=jwt.sign({
        id:user.id

    },JWT_PASSWORD);
    res.json({
        token:token
    });
})

router.get("/",authMidlleware,async(req,res)=>{

    //@ts-ignore
    const id=req.id;
    const user=await prismaClient.user.findFirst({
        where:{
            id
        },
        select:{
            name:true,
            email:true
        }
    });

    return res.json({
        user
    });
})

export const userRouter=router;