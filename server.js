const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PRODUCT_FILE = path.join(__dirname, 'products.json');

app.use(express.static('public'));
app.use(bodyParser.json());

// Read product data
const readProducts = () => {
    if (!fs.existsSync(PRODUCT_FILE)) return [];
    return JSON.parse(fs.readFileSync(PRODUCT_FILE, 'utf8'));
};

// API to get product list
app.get('/products', (req, res) => {
    res.json(readProducts());
});

// Read inventory data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return { inventory: [], sales: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
};

// Write inventory data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// API to get inventory and sales data
app.get('/data', (req, res) => {
    res.json(readData());
});

// API to add inventory data
app.post('/inventory', (req, res) => {
    const { product, purchasedQuantity, unitPrice, timestamp } = req.body;
    let data = readData();
  
    let inventoryItem = data.inventory.find(item => item.product === product);

    if (inventoryItem) {
        inventoryItem.totalPrice += purchasedQuantity * unitPrice;
        inventoryItem.purchasedQuantity += purchasedQuantity;
    } else {
        data.inventory.push({ product, purchasedQuantity, totalPrice: purchasedQuantity * unitPrice, 
                    soldQuantity: 0, timestamp });
    }

    writeData(data);
    res.json({ success: true, data });
});

// API to add sales data
app.post('/sales', (req, res) => {
    const { product, soldQuantity, purchasedPrice, salesPrice, bankFee, ebayFee, shipCost, profit, notes, timestamp  } = req.body;
    let data = readData();
    let inventoryItem = data.inventory.find(item => item.product === product);

    if (inventoryItem && inventoryItem.purchasedQuantity >= inventoryItem.soldQuantity + soldQuantity) {
        inventoryItem.soldQuantity += soldQuantity;
        // New data edited
        //inventoryItem.purchasedPrice += purchasedPrice;
        //inventoryItem.salesPrice += salesPrice;
        //inventoryItem.bankFee += bankFee;
        //inventoryItem.ebayFee += ebayFee;
        //inventoryItem.shipCost += shipCost;
        //const profit = item.salesPrice - item.purchasedPrice - item.bankFee - item.ebayFee - item.shipCost;
        // up to here
        //data.sales.push({ product, soldQuantity, totalPrice: soldQuantity * unitPrice });
        data.sales.push({ product, soldQuantity, purchasedPrice, salesPrice, bankFee, ebayFee, shipCost, 
                        profit : salesPrice - purchasedPrice - bankFee - ebayFee - shipCost, notes, timestamp});
    }

    writeData(data);
    res.json({ success: true, data });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});