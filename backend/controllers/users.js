const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/user');
const handleInvalidDataError = require('../errors/invalid-data-err');
const NotFoundError = require('../errors/not-found-err');

const options = { runValidators: true, new: true };
module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('No user found with that id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  let email;
  if (!validator.isEmail(req.body.email)) {
    email = null;
  } else { email = req.body.email; }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({
      name, about, avatar, password: hash, email,
    }))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      handleInvalidDataError(err, res);
      next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findOneAndUpdate(req.user._id, { name, about }, options)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('No user found with that id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findOneAndUpdate(req.user._id, { avatar }, options)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('No user found with that id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      handleInvalidDataError(err, res);
      next(err);
    });
};
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', {
        expiresIn: '7d',
      });
      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.body._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('No user found with that id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      next(err);
    });
};