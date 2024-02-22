const {Apartement, Booking, Profile, Room, User} = require ('../models')

class Controller{
    static async listApart(req,res){
        try {
            let data = await Apartement.findAll({include : Profile})
            res.send (data)
        } catch (error) {
            res.send(error)
            console.log(error);
        }
    }
}

module.exports = Controller