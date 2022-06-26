import mongoose from "mongoose";
import {Order, OrderStatus} from './Order'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';


interface TicketAttributes {
    id: string;
    title: string;
    price: number;
}

export interface TicketDocument extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}


interface TicketModel extends mongoose.Model<TicketDocument> {
    build(attributes: TicketAttributes): TicketDocument;
    findByEvent(event: {id: string, version: number}): Promise<TicketDocument | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
    }, {
        toJSON: {
            transform(doc, ret) {
                ret.id = doc._id
                delete ret._id
            }
        }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: {id: string, version: number}) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

ticketSchema.statics.build = (attributes: TicketAttributes) => {
    return new Ticket({
        _id: attributes.id,
        title: attributes.title,
        price: attributes.price
    });
}

ticketSchema.methods.isReserved = async function() {
    // this === the ticket document we called isReserved on
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder
}

const Ticket = mongoose.model<TicketDocument, TicketModel>('Ticket', ticketSchema);

export { Ticket }