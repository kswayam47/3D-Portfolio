import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


app.use((req, res, next) => {
    if (req.url.endsWith('.glsl')) {
        res.type('text/plain'); 
    }
    next();
});


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    },
    requireTLS: true,
    debug: true, 
    logger: true 
});


transporter.verify(function(error, success) {
    if (error) {
        console.log('Transporter verification error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});


app.post('/send-email', async (req, res) => {
    const { name, email, phone, description } = req.body;

    
    if (!name || !email || !description) {
        return res.status(400).json({ 
            success: false, 
            message: 'Name, email, and message are required' 
        });
    }

    try {
        
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

        
        console.log('Attempting to send email with options:', {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: mailOptions.subject
        });

        
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


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});


app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, 'projects.html'));
});
app.get('/skills', (req, res) => {
    res.sendFile(path.join(__dirname, 'skills.html'));
});


app.get('/shaders/:filename', (req, res) => {
 
    res.sendFile(path.join(__dirname, 'shaders', req.params.filename));
});


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