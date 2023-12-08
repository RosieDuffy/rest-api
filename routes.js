const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("./models").User;
const Course = require("./models").Course;
const { asyncHandler } = require("./middleware/async-handler");
const { authenticateUser } = require("./middleware/auth-user");

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

router.post(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.status(201).location("/").end();
    } catch (error) {
      console.log(error);
    }
  })
);

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

router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.create(req.body);
      res.status(201).location(`/courses/${course.id}`).end();
    } catch (error) {
      console.log(error);
    }
  })
);

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
        }
      }
    } catch (error) {
      console.log(error);
    }
  })
);

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
        }
      }
    } catch (error) {
      console.log(error);
    }
  })
);

module.exports = router;
