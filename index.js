const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
    
        const allowedOrigins = [
            "https://os.netlabdte.com",
            "http://localhost:3000",
            "http://localhost:8080",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8080"
        ];
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true); // Allow
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`)); // Deny
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
};

// Gunakan middleware CORS
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/store', require('./src/routes/store.route'));
app.use('/user', require('./src/routes/user.route'));
app.use('/item', require('./src/routes/item.route'));
app.use('/transaction', require('./src/routes/transaction.route'));

app.get('/', (req, res) => {
    res.send('Hello World');
  });
  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    }
);