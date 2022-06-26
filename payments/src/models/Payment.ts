import mongoose from "mongoose";
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';



interface PaymentAttributes {
    orderId: string;
    stripeId: string;
}

interface PaymentDocument extends mongoose.Document {
    orderId: string;
    stripeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDocument> {
    build(attributes: PaymentAttributes): PaymentDocument;
}

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true
        },
        stripeId: {
            type: String,
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


paymentSchema.statics.build = (attributes: PaymentAttributes) => {
    return new Payment(attributes);
}

const Payment = mongoose.model<PaymentDocument, PaymentModel>('Payment', paymentSchema);

export { Payment }