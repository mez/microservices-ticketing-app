import mongoose from "mongoose";
import { OrderStatus } from '@anonytickets/common'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';



interface OrderAttributes {
    id: string;
    userId: string;
    version: number;
    price: number;
    status: OrderStatus;
}

interface OrderDocument extends mongoose.Document {
    userId: string;
    version: number;
    price: number;
    status: OrderStatus;
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
        price: {
            type: Number,
            required: true
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
    return new Order({
        _id: attributes.id,
        version: attributes.version,
        price: attributes.price,
        userId: attributes.userId,
        status: attributes.status
    });
}

const Order = mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

export { Order }