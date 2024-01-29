const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenre = await Genre.find({}).sort({ name: 1 }).exec();
  res.render("genreList", {
    title: "Genre List",
    genre_list: allGenre,
  });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, bookInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genreDetail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: bookInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genreForm", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .toLowerCase()
    .escape(),
  asyncHandler(async (req, res, next) => {
    const error = validationResult(req);
    const genre = new Genre({ name: req.body.name });
    if (!error.isEmpty()) {
      res.render("genreForm", {
        title: "Create Genre",
        genre: genre,
        errors: error.array(),
      });
      return;
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collection({ locale: "en", strength: 2 })
        .exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, booksWithGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (genre === null) {
    res.redirect("/catalog/genres");
  }

  res.render("genreDelete", {
    title: "Delete Genre",
    genre: genre,
    genre_books: booksWithGenre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, booksWithGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);

  if (booksWithGenre.length > 0) {
    res.render("genreDelete", {
      title: "Delete Genre",
      genre: genre,
      genre_books: booksWithGenre,
    });
    return;
  } else {
    await Genre.findByIdAndDelete(req.body.genreid);
    res.redirect("/catalog/genres");
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();
  res.render("genreForm", {
    title: "Update Genre",
    genre: genre,
  });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre name must contain at least 3 characters!")
    .trim()
    .isLength({ min: 3 })
    .toLowerCase()
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({
        name: req.body.name,
        _id: req.params.id,
    });

    if(!errors.isEmpty()){
        res.render("genreForm",{
            title: "Update Genre",
            genre: genre,
            errors: errors.array(),
        });
        return;
    } else {
        const genreExists = await Genre.findOne({name: req.body.name})
            .collection({locale: "en", strength:2})
            .exec();

        if(genreExists){
            res.redirect(genreExists.url);
        } else {
            const updateGenre = await Genre.findByIdAndUpdate(req.params.id,genre,{}).exec();
            res.redirect(updateGenre.url);
        }
    }
  }),
];
