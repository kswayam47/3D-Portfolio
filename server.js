import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Add MIME type configuration for .glsl files
app.use((req, res, next) => {
    if (req.url.endsWith('.glsl')) {
        res.type('text/plain'); // Set correct MIME type for GLSL files
    }
    next();
});

// Create email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // This should be an App Password, not your regular Gmail password
    },
    requireTLS: true,
    debug: true, // Enable debug logs
    logger: true // Enable logger
});

// Verify the connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log('Transporter verification error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Email endpoint
app.post('/send-email', async (req, res) => {
    const { name, email, phone, description } = req.body;

    // Add validation
    if (!name || !email || !description) {
        return res.status(400).json({ 
            success: false, 
            message: 'Name, email, and message are required' 
        });
    }

    try {
        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Message:</strong></p>
                <p>${description}</p>
            `
        };

        // Add more detailed error logging
        console.log('Attempting to send email with options:', {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: mailOptions.subject
        });

        // Send email
        await transporter.sendMail(mailOptions);
        
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Detailed error sending email:', {
            error: error.message,
            stack: error.stack,
            code: error.code,
            response: error.response
        });
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send email: ' + error.message 
        });
    }
});

// Add these routes before your email endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Add this route with your other routes
app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, 'projects.html'));
});
app.get('/skills', (req, res) => {
    res.sendFile(path.join(__dirname, 'skills.html'));
});

// Update the shader route
app.get('/shaders/:filename', (req, res) => {
    // Remove the .glsl extension check since we handle it with MIME type above
    res.sendFile(path.join(__dirname, 'shaders', req.params.filename));
});

// Fix the static paths handling
const staticPaths = [
    '/node_modules',
    '/node_modules/bidi-js',
    '/node_modules/webgl-sdf-generator',
    '/node_modules/troika-worker-utils',
    '/node_modules/troika-three-utils',
    '/fonts'
];

staticPaths.forEach(pathStr => {
    app.use(pathStr, express.static(pathStr.includes('node_modules') ? 
        pathStr.replace('/node_modules', path.dirname(new URL(import.meta.url).pathname) + '/node_modules') : 
        path.dirname(new URL(import.meta.url).pathname) + pathStr.replace('/fonts', '/assets/fonts'), {
        maxAge: '1y',
        etag: true,
        lastModified: true
    }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});