import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    videoUrl: String,
    duration: Number,
    order: Number,
    isFreePreview: {
        type: Boolean,
        default: false
    },
    attachments: [{
        name: String,
        url: String,
        size: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Lesson', lessonSchema);