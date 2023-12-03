// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const axios = require('axios');
const
// Create an Express application
const app = express();

// Connect to MongoDB using Mongoose
const mongodbURI = "mongodb+srv://user:user@password-storage.vufdfbo.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(mongodbURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Handle MongoDB connection events
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Use middleware to enable CORS
app.use(cors());

// Use middleware to secure HTTP headers
app.use(helmet());

// Use middleware to parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





const inquirySchema = new mongoose.Schema({
    personalDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
    },
    organizationDetails: {
        chooseOrg: { type: String, required: true },
        nameOfOrg: { type: String },
    },
    productDetails: {
        typeOfApparel: { type: String },
        numberOfPieces: { type: String },
        ApproximatePrice: { type: String },
    },
    query: {
        text: { type: String },
        imageLink: { type: String },
    },
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

function returnHTML(data) {
    const htmlText = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Content</title>
</head>
<body>
    <h2>Contact Information:</h2>
    <ul>
        <li><strong>Name:</strong> ${data.name}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Phone Number:</strong> ${data.phoneNumber}</li>
    </ul>

    <h2>Organization Information:</h2>
    <ul>
        <li><strong>Choose Organization:</strong> ${data.chooseOrg}</li>
        <li><strong>Name of Organization:</strong> ${data.nameOfOrg}</li>
    </ul>

    <h2>Order Details:</h2>
    <ul>
        <li><strong>Type of Apparel:</strong> ${data.typeOfApparel}</li>
        <li><strong>Number of Pieces:</strong> ${data.numberOfPieces}</li>
        <li><strong>Approximate Price:</strong> ${data.ApproximatePrice}</li>
    </ul>

    <h2>Additional Information:</h2>
    <ul>
        <li><strong>Text:</strong> ${data.text}</li>
        <li><strong>Image Link:</strong> ${data.imageLink}</li>
    </ul>
</body>
</html>
`;

    // console.log(htmlText);

    return (htmlText)
}


async function sendEmail(emailData) {
    try
    {
        const response = await axios.post('http://email4320414842.canverro.com/send_email/', emailData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Email sent successfully:', response.data);
        return response.data;
    } catch (error)
    {
        console.error('Error sending email:', error.response.data);
        throw error.response.data;
    }
}




app.post('/submitInquiry', async (req, res) => {
    try
    {
        // Extract all details from the request body
        const {
            name,
            email,
            phoneNumber,
            chooseOrg,
            nameOfOrg,
            typeOfApparel,
            numberOfPieces,
            ApproximatePrice,
            text,
            imageLink,
        } = req.body;


        const html = returnHTML(req.body);
        // console.log(html)

        // Create a new Inquiry instance
        const newInquiry = new Inquiry({
            personalDetails: {
                name,
                email,
                phoneNumber,
            },
            organizationDetails: {
                chooseOrg,
                nameOfOrg,
            },
            productDetails: {
                typeOfApparel,
                numberOfPieces,
                ApproximatePrice,
            },
            query: {
                text,
                imageLink,
            },
        });

        // Save the new inquiry to the database
        const savedInquiry = await newInquiry.save();

        // Example usage:
        const emailData = {
            subject: 'New Feedback received',
            to_email: 'zigyprints@gmail.com',
            message: html,
            html_body: html,
        };

        sendEmail(emailData);

        // Respond with the saved inquiry
        res.status(201).json(savedInquiry);
    } catch (error)
    {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Start the Express server
const port = 5000;
app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on http://localhost:${5000}`);
});
