export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({id: 'stripe_charge_id'})
    }
}