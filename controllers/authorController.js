const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ last_name: 1 }).exec();
  res.render("authorList", {
    title: "Author List",
    author_list: allAuthors,
  });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, booksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author == null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("authorDetail", {
    title: "Author Detail",
    author: author,
    author_books: booksByAuthor,
  });
});

// Display Author create form on GET.
exports.author_create_get = async (req, res, next) => {
  res.render("authorForm", {
    title: "Create Author",
  });
};

// Handle Author create on POST.
exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Fist name must be specified."),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name must be specified."),
  body("date_of_birth", "Invalid date of birth.")
    .optional({ vlaues: "falsy" })
    .isISO8601()
    .toDate()
    .escape(),
  body("date_of_death", "Invalid date of death.").toDate().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      res.render("authorForm", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      await author.save();
      res.redirect(author.url);
    }
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBookByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author == null) {
    res.redirect("/catalog/authors");
  }

  res.render("authorDelete", {
    title: "Delete Author",
    author: author,
    author_books: allBookByAuthor,
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBookByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBookByAuthor.length > 0) {
    res.render("authorDelete", {
      title: "Delete Author",
      author: author,
      author_books: allBookByAuthor,
    });
    return;
  } else {
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();

  if (author === null) {
    const err = new Error("Author not found!");
    err.status = 404;
    return next(err);
  }
  res.render("authorForm", {
    title: "Update Author",
    author: author,
  });
});

// Handle Author update on POST.
exports.author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Author first name must be specified!"),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Author Last Name must be specified!"),
  body("date_of_birth", "Invalide Date Of Birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate()
    .escape(),
  body("date_of_death", "Invalid Date of Death").toDate().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id,
    });

    if(!errors.isEmpty()){
        res.render("authorForm", {
            title: "Update Author",
            author: author,
            errors: errors.array(),
        });
        return;
    } else {
        const updateAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});
        res.redirect(updateAuthor.url);
    }

  }),
];
