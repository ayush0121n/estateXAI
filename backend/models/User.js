const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: ''
    },
    institution: {
        type: String,
        default: ''
    },
    workplace: {
        type: String,
        default: ''
    },
    savedProperties: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    savedPGs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PG'
    }],
    isVerified: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Hash password before saving (Mongoose 9 compatible)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
