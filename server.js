const express = require('express');
const Razorpay = require('razorpay');
const app = express();

const razorpay = new Razorpay({
    key_id: 'rzp_test_Kd6pRCgzjidynQ',
    key_secret: '3KRv0pD6fxejErOv087HD6nB'
});

// Add CORS support at the top
const cors = require('cors');
app.use(cors());

// Add health check endpoint
app.get('/ping', (req, res) => res.send('pong'));

// Update order creation endpoint
app.post('/create-order', express.json(), async (req, res) => {
    if (!req.body.amount) {
        return res.status(400).send('Amount is required');
    }
    
    const options = {
        amount: req.body.amount,
        currency: "INR",
        receipt: "order_rcpt_001"
    };
    
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));