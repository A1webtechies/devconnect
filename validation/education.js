const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.feildofstudy = !isEmpty(data.feildofstudy) ? data.feildofstudy : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.school)) {
    errors.school = "School field is required";
  }

  if (Validator.isEmpty(data.degree)) {
    errors.degree = "Degree field is required";
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = "From field is required";
  }
  if (Validator.isEmpty(data.feildofstudy)) {
    errors.feildofstudy = "field of study  is required";
  }
  if (!Validator.isEmpty(data.from)) {
    //  yaer/month/day
    if (!Validator.isISO8601(data.from)) {
      errors.from = "From field is not a valid date";
    }
  }
  if (!Validator.isEmpty(data.to)) {
    //  yaer/month/day
    if (!Validator.isISO8601(data.to)) {
      errors.from = "To field is not a valid date";
    }
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
