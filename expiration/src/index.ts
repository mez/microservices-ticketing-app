import { OrderCancelledListener, OrderCreatedListener } from './events/listeners/order';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID env is missing.')
    }
    if (!process.env.NATS_URI) {
        throw new Error('NATS_URI env is missing.')
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID env is missing.')
    }

    await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID, 
        process.env.NATS_CLIENT_ID, 
        process.env.NATS_URI
    ); 

    natsWrapper.client.on('close', () => {
        console.log('NATS connection closed');
        process.exit();
    });
    process.on('SIGINT', ()=> natsWrapper.client.close());
    process.on('SIGTERM', ()=> natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

};

start();