const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  }

  if (Validator.isEmpty(data.company)) {
    errors.company = "Company field is required";
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = "From field is required";
  }
  if (!Validator.isEmpty(data.from)) {
    //  yaer/month/day
    if (!Validator.isISO8601(data.from)) {
      errors.from = "From field is not a valid date";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};