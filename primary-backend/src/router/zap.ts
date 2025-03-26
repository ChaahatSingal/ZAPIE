import { Router } from "express";
import { authMidlleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";
const router=Router();

router.post("/",authMidlleware,async(req,res)=>{
    //@ts-ignore
    const id:string=req.id;
    const body=req.body;
    const parseddata=ZapCreateSchema.safeParse(body);
    if(!parseddata){
        return res.status(411).json({
            message:"Incorrect input"
        });
    }
    const zapId= await prismaClient.$transaction(async tx=>{
        const zap=await prismaClient.zap.create({
            data:{
                userId:parseInt(id),
                triggerId:"",
                actions:{
                    create: parseddata.data.actions.map((x,index)=>({
                        actionId:x.availableActionId,
                        sortingOrder:index,
                        metadata:x.actionMetadata
                    }))
                }

            }
        })
        const trigger=await tx.trigger.create({
            data:{
                triggerId:parseddata.data?.availableTriggerId,
                zapId:zapId,
            }
        });
        await tx.zap.update({
            where:{
                id:zap.id
            },
            data:{
                triggerId:trigger.id
            }
        })
        return zap.id;
    })
    return res.json({
        zapId
    })
})
router.get("/",authMidlleware,async(req,res)=>{
    //@ts-ignore
    const id=req.id;
    const zaps=await prismaClient.zap.findMany({
        where:{
            userId:id
        },
        include:{
            actions:{
                include:{
                    type:true
                }
            },
            trigger:{
                include:{
                    type:true
                }
            }
        }
    });
    return res.json({
        zaps
    })
})
router.get("/:zapId",authMidlleware,async(req,res)=>{
    //@ts-ignore
    const id=req.id;
    const zapId= req.params.zapId;
    const zap=await prismaClient.zap.findFirst({
        where:{
            id:zapId,
            userId:id
        },
        include:{
            actions:{
                include:{
                    type:true
                }
            },
            trigger:{
                include:{
                    type:true
                }
            }
        }
    });
    return res.json({
        zap
    })
})
export const zapRouter=router;