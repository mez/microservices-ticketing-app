import mongoose from "mongoose";
import { OrderStatus } from '@anonytickets/common'
import {TicketDocument} from './Ticket'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

export { OrderStatus }

interface OrderAttributes {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDocument;
}

interface OrderDocument extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDocument;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDocument> {
    build(attributes: OrderAttributes): OrderDocument;
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created
        }, 
        expiresAt: {
            type: mongoose.Schema.Types.Date
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket'
        }
    }, {
        toJSON: {
            transform(doc, ret) {
                ret.id = doc._id
                delete ret._id
            }
        }
    }
);

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attributes: OrderAttributes) => {
    return new Order(attributes);
}

const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

export { Order }