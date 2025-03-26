import { Kafka } from "kafkajs";
const TOPIC_NAME="zap-events";
const kafka=new Kafka({
    clientId:'outbox-processor-2',
    brokers:['localhost:9092']
})
async function main() {
    const consumer=kafka.consumer({groupId:'main-worker'});
    await consumer.connect();
    const producer=kafka.producer();
    await consumer.subscribe({topic:TOPIC_NAME,fromBeginning:true})
    await consumer.run({
        autoCommit:false,
        eachMessage:async({topic,partition,message})=>{
            console.log({
                partition,
            offset:message.offset,
                value:message.value?.toString()
        })
        if(!message.value?.toString){
            return;
        }
        }
        
        await new Promise(r => setTimeout(r, 500));
        await consumer.commitOffsets([{
            topic:TOPIC_NAME,
            partition:Partition,
            offset:(parseInt(MessageChannel.offset)+1.toString)
        }])
    })
}