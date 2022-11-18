const Sequelize = require('sequelize');
var sequelize = new Sequelize('ruuqczma', 'ruuqczma', 't2hb3IOcFVFQ8SjSVVZVEmjmCjma-qlJ', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
    , query: { raw: true }
});
var Student = sequelize.define('Student', {
    studentID: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    isInternationalStudent: Sequelize.BOOLEAN,
    expectedCredential: Sequelize.STRING,
    status: Sequelize.STRING,
    registrationDate: Sequelize.STRING
});
var Program = sequelize.define('Program', {
    programCode: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    programName: Sequelize.STRING
});

Program.hasMany(Student, {foreignKey: 'program'});

module.exports.initialize = function(){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            resolve();
        }).catch(function () {
            reject("Unable to sync database.");
        });
});
}
module.exports.getAllStudents = function(){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Student.findAll({
                order: ['studentID']
            }).then(function(Student){
                resolve(Student);
            }).catch(function () {
                reject("No results returned.");
            });
        });
    });
}

module.exports.getStudentsByStatus= function(status){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            if (status) {
                Student.findAll({ 
                    order: ['studentID'],
                    where: {
                        status: status
                    }
                }).then(function(data){
                    resolve(data);
                }).catch(function() {
                    reject("No results returned.");
                })
            }
            else 
                reject("Status not valid.");
        });
    });
}

module.exports.getStudentsByProgramCode= function(programCode){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            if (programCode) {
                Student.findAll({ 
                    order: ['studentID'],
                    where: {
                        programCode: programCode
                    }
                }).then(function(data){
                    resolve(data);
                }).catch(function() {
                    reject("No results returned.");
                })
            }
            else 
                reject("Status not valid.");
        });
    });
}

module.exports.getStudentsByExpectedCredential= function(credential){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            if (credential) {
                Student.findAll({ 
                    order: ['studentID'],
                    where: {
                        credential: credential
                    }
                }).then(function(data){
                    resolve(data);
                }).catch(function() {
                    reject("No results returned.");
                })
            }
            else 
                reject("Status not valid.");
        });
    });
}

module.exports.getStudentById= function(Id){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            if (Id) {
                Student.findAll({ 
                    order: ['studentID'],
                    where: {
                        studentID: Id
                    }
                }).then(function(data){
                    resolve(data);
                }).catch(function() {
                    reject("No results returned.");
                })
            }
            else 
                reject("Status not valid.");
        });
    });
}

module.exports.getProgramByCode = function(pcode) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            if (pcode) {
                Program.findAll({ 
                    order: ['programCode'],  
                    where: {
                        programCode: pcode
                    }
                }).then(function(data){
                    resolve(data[0]);
                }).catch(function() {
                    reject("No program results returned.");
                })
            }
            else 
                reject("Program number not valid.");
        });
    });  
}
module.exports.deleteProgramByCode = function(pcode) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Program.destroy({
                where: { programCode: pcode } 
            })
        }).then(function () { 
            resolve();
        }).catch(function () {
            reject("Unable to delete program.");
        });
    });
}
module.exports.getPrograms= function(){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Program.findAll({
                order: ['programCode']
            }).then(function(Program){
                resolve(Program);
            }).catch(function () {
                reject("No results returned.");
            });
        });
    });
}

module.exports.addStudent = function(studentData){    
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            studentData.isInternationalStudent = (studentData.isInternationalStudent) ? true : false;
            for (i in studentData) {
                if (studentData[i] == "")
                studentData[i] = null;
            }
            Student.create({
                studentID: studentData.studentID,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                email: studentData.email,
                phone: studentData.phone,
                addressStreet: studentData.addressStreet,
                addressCity: studentData.addressCity,
                addressState: studentData.addressState,
                addressPostal: studentData.addressPostal,
                isInternationalStudent: studentData.isInternationalStudent,
                expectedCredential: studentData.expectedCredential,
                status: studentData.status,
                registrationDate: studentData.registrationDate, 
                program: studentData.program
            }).then(function(){
                resolve(Student);
            }).catch(function() {
                reject("Unable to create student.");
            });
        });
    });
}
         
module.exports.updateStudent= function(studentData){ 
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            studentData.isInternationalStudent = (studentData.isInternationalStudent) ? true : false;
            for (i in studentData) {
                if (studentData[i] == "")
                studentData[i] = null;
            } 
            Student.update({
                studentID: studentData.studentID,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                email: studentData.email,
                phone: studentData.phone,
                addressStreet: studentData.addressStreet,
                addressCity: studentData.addressCity,
                addressState: studentData.addressState,
                addressPostal: studentData.addressPostal,
                isInternationalStudent: studentData.isInternationalStudent,
                expectedCredential: studentData.expectedCredential,
                status: studentData.status,
                registrationDate: studentData.registrationDate, 
                program: studentData.program
            }, 
            { where: {studentID: studentData.studentID}})
            }).then(function(){
                resolve();
            }).catch(function() {
                reject("Unable to create student.");
            });
        });
    }

    module.exports.addProgram = function(programData) {
        return new Promise(function (resolve, reject) {
            sequelize.sync().then(function () {
                for (var i in programData) {
                    if (programData[i] == "")
                        programData[i] = null;
                } 
                Program.create(programData)
            }).then(function() {
                resolve();
            }).catch(function () {
                reject("Unable to create program.");
            })
        });
    }

    module.exports.updateProgram = function(programData) {
        return new Promise(function (resolve, reject) {
            sequelize.sync().then(function () {
                for (i in programData) {
                    if (programData[i] == "")
                        programData[i] = null;
                } 
                Program.update({
                    programCode: programData.programCode,
                    programName: programData.programName
                    },
                    { where: {programCode: programData.programCode}}
                )
            }).then(function() {
                resolve();
            }).catch(function () {
                reject("Unable to update program.");
            })      
        });
    }
    module.exports.deleteStudentById = function(id) {
        return new Promise(function (resolve, reject) {
            sequelize.sync().then(function () {
                Student.destroy({
                    where: { studentID: id } 
                })
            }).then(function () { 
                resolve();
            }).catch(function () {
                reject("Unable to delete student.");
            });
        });
    }