const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();
  res.render("bookInstanceList", {
    title: "Book Insatnce List",
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance == null) {
    const err = new Error("Book copy not found!");
    err.status = 404;
    return next(err);
  }

  res.render("bookInstanceDetail", {
    title: "Book",
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  res.render("bookInstanceForm", {
    title: "Creat BookInstance",
    book_list: allBooks,
    status_list: ["Maintenance", "Available", "Loaned", "Reserved"],
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid Date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
      res.render("bookInstanceForm", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id.toString(),
        errors: errors.array(),
        bookinstance: bookInstance,
        status_list: ["Maintenance", "Available", "Loaned", "Reserved"],
      });
      return;
    } else {
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    res.redirect("/catalog/bookinstances");
  }

  res.render("bookInstanceDelete", {
    title: "Delete Book Copies",
    bookinstance: bookInstance,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookInstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).populate("book").exec(),
    Book.find({}, "title").sort({ title: 1 }).exec(),
  ]);

  res.render("bookInstanceForm", {
    title: "Update BookInstance",
    book_list: allBooks,
    bookinstance: bookInstance,
    selected_book: bookInstance.book._id.toString(),
    status_list: ["Maintenance", "Available", "Loaned", "Reserved"],
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  body("book", "Book must be specified!").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprit must be specified!")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid Date!")
    .optional({ values: "fasly" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Books.find({}, "title").sort({ title: 1 }).exec();

      res.render("bookInstanceForm", {
        title: "Update Book Instance",
        book_list: allBooks,
        bookinstance: bookInstance,
        selected_book: bookInstance.book._id.toString(),
        status_list: ["Maintenance", "Available", "Loaned", "Reserved"],
        errors: errors.array(),
      });
      return;
    } else {
      const updateBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {}
      ).exec();
      res.redirect(updateBookInstance.url);
    }
  }),
];
