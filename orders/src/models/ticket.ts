import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface IEvent {
    id: string;
    version: number;
};
interface TicketAttrs {
    id: string;
    title: string;
    price: number;
    // version: number;
};

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;

    isReserved(): Promise<boolean>;
};

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: IEvent): Promise<TicketDoc | null>;
};

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
            ret.id = ret._id;
            delete ret._id;
        }
    }
})

ticketSchema.statics.findByEvent = (event: IEvent) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

// ticketSchema.pre('save', function(done) {
//     this.$where = {
//         version: this.get('version') - 1
//     }

//     done();
// });

ticketSchema.statics.build = (attrs: TicketAttrs) => new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.methods.isReserved = async function() {
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
    return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };