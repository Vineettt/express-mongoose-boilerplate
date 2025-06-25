const { validate } = require('deep-email-validator');

const validateEmail = async (email:string) => {
    const response = await validate({
        email: email,
        sender: email,
        validateRegex: true,
        validateMx: true,
        validateTypo: false,
        validateDisposable: true,
        validateSMTP: false,
    })
    let validator_text = response.reason;
    if (response.valid == false) {
        return [false, response.validators[validator_text].reason];
    } else {
        return [true];
    }
}

module.exports = validateEmail;