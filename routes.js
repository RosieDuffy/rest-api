const express = require("express");
const router = express.Router();

// Model imports
const User = require("./models").User;
const Course = require("./models").Course;

// Middleware functions
const { asyncHandler } = require("./middleware/async-handler");
const { authenticateUser } = require("./middleware/auth-user");

// **** USER ROUTES **** //

// GET route - authenticates user and returns id, first and last name and email address
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
    });
  })
);

// POST route to CREATE new user. Redirects to '/' root after completion 
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.status(201).location("/").end();
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

// **** COURSE ROUTES **** //

// GET route for list of all courses, returns only vital info and the course owner (User) 
router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
    });
    if (courses) {
      res.status(200).json(courses);
    } else {
      res.status(404).json({ message: "Courses not found" });
    }
  })
);

// GET route for individual course, returns only vital info and the course owner (User)
router.get(
  "/courses/:id",
  asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
    });
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  })
);

// POST route. Authenticates the user and creates new course 
router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.create(req.body);
      res.status(201).location(`/courses/${course.id}`).end();
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);


// PUT route. Authenticates user and UPDATES individual course
router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        if (course.userId == req.currentUser.id) {
          await course.update(req.body);
          res.status(204).location(`/courses/${course.id}`).end();
        } else {
          res
            .status(403)
            .json({ message: "Access denied. You are not the course owner" });
        }
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

// DELETE route. Deletes an individual course after user authentication.
router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        if (course.userId == req.currentUser.id) {
          await course.destroy();
          res.status(204).end();
        } else {
          res
            .status(403)
            .json({ message: "Access denied. You are not the course owner" });
        }
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } catch (error) {
      console.log(error);
    }
  })
);

module.exports = router;
