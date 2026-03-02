const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            // Send welcome/verification email
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
            const message = `
                <h1>Welcome to Brand Builder, ${user.name}!</h1>
                <p>Thank you for registering. You can log in using the link below:</p>
                <a href="${verificationUrl}" clicktracking="off">${verificationUrl}</a>
            `;

            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Welcome to Brand Builder - Verify Email',
                    html: message,
                });
            } catch (error) {
                console.error('Email sending error (user created successfully):', error);
            }

            const response = {
                _id: user._id,
                name: user.name,
                email: user.email,
                addresses: user.addresses,
                token: generateToken(user._id),
            };

            if (user.role && user.role !== 'user') {
                response.role = user.role;
            }

            res.status(201).json(response);
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('Attempting to authenticate user with email:', email, password);

        // Use full select since password is set to select: false in schema
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            const response = {
                _id: user._id,
                name: user.name,
                email: user.email,
                addresses: user.addresses,
                token: generateToken(user._id),
            };

            if (user.role && user.role !== 'user') {
                response.role = user.role;
            }

            res.json(response);
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const response = {
                _id: user._id,
                name: user.name,
                email: user.email,
                addresses: user.addresses || [],
            };

            if (user.role && user.role !== 'user') {
                response.role = user.role;
            }

            res.json(response);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Add new address
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = async (req, res, next) => {
    try {
        const { address, city, postalCode, country, phone, isDefault } = req.body;
        console.log('Adding address for user:', req.user._id, { address, city, postalCode, country, phone, isDefault });
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.addresses) {
            user.addresses = [];
        }

        if (user.addresses.length >= 3) {
            return res.status(400).json({ message: 'Maximum of 3 addresses allowed' });
        }

        if (phone) {
            const cleanedPhone = phone.replace(/\D/g, "");
            if (cleanedPhone.length !== 10) {
                return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
            }
        }

        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({ address, city, postalCode, country, phone, isDefault: isDefault || user.addresses.length === 0 });
        user.markModified('addresses');
        await user.save();

        res.status(201).json({ addresses: user.addresses });
    } catch (error) {
        console.error("Error adding address:", error);
        next(error);
    }
};

// @desc    Update address
// @route   PUT /api/auth/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
    try {
        const { address, city, postalCode, country, phone, isDefault } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.addresses || user.addresses.length === 0) {
            return res.status(404).json({ message: 'No addresses found' });
        }

        const addrIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);
        if (addrIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        if (phone) {
            const cleanedPhone = phone.replace(/\D/g, "");
            if (cleanedPhone.length !== 10) {
                return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
            }
        }

        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses[addrIndex] = { ...user.addresses[addrIndex].toObject(), address, city, postalCode, country, phone, isDefault };
        user.markModified('addresses');
        await user.save();

        res.json({ addresses: user.addresses });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (!user.addresses) {
            user.addresses = [];
        }

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);

        if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({ addresses: user.addresses });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
};
