const mongoose = require("mongoose");
const {DateTime} = require("luxon");
const Schema = mongoose.Schema;


const BookInstanceSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: "Book", required:true},
    imprint: { type: String, required: true},
    status: {
        type: String,
        enum: ["Available", "Maintenance", "Loaned", "Reserved"],
        default: "Maintenance",
    },
    due_back: { type: Date, default: Date.now},
});

BookInstanceSchema.virtual("url").get(function(){
    return "/catalog/bookinstance/"+this._id;
})

BookInstanceSchema.virtual("due_date_formatted").get(function(){
    return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual("due_back_yyyy_mm_dd").get(function(){
    return DateTime.fromJSDate(this.due_back).toISDate();
})


module.exports = mongoose.model("BookInstance", BookInstanceSchema);
