let chai = require("chai")
let mocha = require("mocha")
let chaiHttp = require("chai-http")

let sever = require("../server")
chai.use(chaiHttp)
let should = chai.should()

describe('user', () => {

    after(() => {
        process.exit();
    });

    let logingdata = {
        username: 'awanthika',
        password: '123'
    }

    it('/login', (done) => {
        chai.request(sever.app)
            .post('/login')
            .send(logingdata)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                res.should.have.status(200)
                done()
            })
    })

    let signupdata = {
        username: 'tishan',
        email: 'tishan@gmail.com',
        contact: '0717860780',
        nic: '200025004338',
        password: '12345'
    }

    it('/signup', (done) => {
        chai.request(sever.app)
            .post('/signup')
            .send(signupdata)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                res.should.have.status(200)
                done()
            })
    })
})
