const validator = require('validator');

class Validation {
    userValidation(body, passwordCondition) {
        let validationType = true
        
        const { name, surname, email, password } = body;
        const validName = this.validatorName(name)
        const validSurname = this.validatorSurname(surname)
        const validEmail = this.validatorEmail(email)
        const validPass = !passwordCondition ? this.validatorPassword(password) : ''
        if(validName || validEmail || validPass || validSurname){
            validationType = false
        }
        return {
            validationType,
            messages: [
                { name: validName },
                { email: validEmail },
                { password: validPass },
                { surname: validSurname },
            ]
        }
    }
    catValidation(body) {
        let validationType = true
        const { title, description } = body;
        
        const validTitle = this.validatorTitle(title)
        const validDesc = this.validatorDesc(description)
        if(validTitle || validDesc){
            validationType = false
        }
        return {
            validationType,
            messages: [
                validTitle !== '' ? { title: validTitle } : 
                validDesc !== '' ? { desc: validDesc } : true
            ]
        }
    }
    validatorName(name) {
        if(!name) return 'name is required'
        return ''
    }
    validatorSurname(surname) {
        if(!surname) return 'name is required'
        return ''
    }
    validatorEmail(email) {
        if(!email) return 'email is required'
        if(!validator.isEmail(email)) 'email is invalid'
        return ''
    }
    validatorPassword(password) {
        if(!password) return 'password is required'
        if(!validator.isLength(password,6)) return 'password is too short'
        return ''
    }
    validatorTitle(title) {
        if(!title) return 'title is required'
        return ''
    }
    validatorDesc(desc) {
        if(!desc) return 'description is required'
        if(!validator.isLength(desc, 6)) return 'description is too short'
        return ''
    }
}
module.exports = new Validation();