const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: 'rzp_test_Kd6pRCgzjidynQ',
    key_secret: '3KRv0pD6fxejErOv087HD6nB'
});

// Health check endpoint
app.get('/ping', (req, res) => res.send('pong'));

// Create order endpoint
app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt = 'order_receipt_' + Date.now() } = req.body;

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        const options = {
            amount: parseInt(amount * 100), // Convert to paise
            currency,
            receipt,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        res.json({
            orderId: order.id,
            currency: order.currency,
            amount: order.amount
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", razorpay.key_secret)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test server at: http://localhost:${PORT}/ping`);
});