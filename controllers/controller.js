const { User, Room, Apartement, Booking, Profile } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require('bcryptjs');
const pdfkit = require('pdfkit')
const fs = require('fs')
const pdfService = require('../service/pdf-service')


class Controller {
  static home(req, res) {
    res.render("home");
  }

  static register(req, res) {
    let error  = req.query.error;
    if (error){
        error  = error.split(",")
    }else{
        error = []
    }
    res.render("register", {error});
  }

  static async postRegister(req, res) {
    try {
      const { email, password, role } = req.body;
      await User.create({ email, password, role });
      res.redirect("/");
    } catch (error) {
        let message = []
        if (error.name === "SequelizeValidationError"){
            error.errors.map((item) => {
                message.push(item.message)
            })
            res.redirect(`/register?error=${message}`)
        }else {
            console.log(error);
            res.send(error)
        }
    }
  }

  static login(req, res) {
    let error  = req.query.error;
    if (error){
        error  = error.split(",")
    }else{
        error = []
    }
    res.render("login", {error});
  }

  static async postLogin(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new Error("Email/Password not found");
      }
      req.session.userId = user.id;
      req.session.userRole = user.role;
      res.redirect(`/${user.role.toLowerCase()}`);
    } catch (error) {
        res.redirect(`/login?error=${error.message}`)
    }
  }

  static async getProfile(req, res) {
    try {
        let error  = req.query.error;
        if (error){
            error  = error.split(",")
        }else{
            error = []
        }
      const user = await User.findOne({
        where: {
          id: req.session.userId,
        },
        include: Profile,
      });
      res.render("role", { user, error });
    } catch (error) {
      res.send(error);
    }
  }

  static async postProfile(req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.session.userId,
        },
      });
      const { name, gender, nik, birthDate } = req.body;
      await Profile.create({
        name,
        gender,
        nik,
        birthDate,
        UserId: req.session.userId,
      });
      res.redirect(`/${user.role.toLowerCase()}`);
    } catch (error) {
        let message = []
        if (error.name === "SequelizeValidationError"){
            error.errors.map((item) => {
                message.push(item.message)
            })
            res.redirect(`/host?error=${message}`)
        }else {
            console.log(error);
            res.send(error)
        }
    }
  }

  static async getAllApartement(req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.session.userId,
        },
      });
      const { search, info } = req.query;
      let data = [];

      if (!search) {
        data = await Apartement.findAll({
          include: {
            model: Room,
            attributes: ["name"],
          },
        });
      } else {
        data = await Apartement.findAll({
          include: {
            model: Room,
            attributes: ["name"],
          },
          where: {
            name: {
              [Op.iLike]: `%${search}%`,
            },
          },
        });
      }

      console.log(data);
      res.render("apartement", { data, user, info });
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }

  static async getApartementByHost(req, res) {
    try {
      const { info } = req.query;

      const data = await Apartement.findAll({
        include: [
          {
            model: User,
            where: {
              id: req.session.userId,
            },
          },
          {
            model: Room,
            attributes: ["name"],
          },
        ],
      });
      const user = await User.findOne({
        where: {
          id: req.session.userId,
        },
      });
      // res.send(data)
      res.render("apartement", { data, user, info });
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }

  static async addApartementForm(req, res) {
    try {
      const { error } = req.query;

      const user = await User.findOne({
        where: {
          id: req.session.userId,
        },
      });
      res.render("formAddHost", { user, error });
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }

  static async addApartement(req, res) {
    try {
      const { name, rate, facility, price, location } = req.body;
      const buffer = req.file.buffer;
      const decodeBuffer = Buffer.from(buffer).toString("base64");
      const changeImg = `data:${req.file.mimetype};base64,${decodeBuffer}`;
      await Apartement.create({
        name,
        rate,
        facility,
        price,
        location,
        imgUrl: changeImg,
      });
      const { id } = await Apartement.findOne({
        attributes: ["id"],
        where: {
          name,
          rate,
          facility,
          price,
          location,
        },
      });
      await Booking.create({
        ApartementId: id,
        UserId: req.session.userId,
        startDate: new Date(),
        endDate: new Date(2024, 11, 31),
      });
      res.redirect("/host/apartement");
    } catch (error) {
      res.redirect(`/host/apartement/add?error=${error.message}`);
    }
  }

  static async editApartementForm(req, res) {
    try {
      const user = await User.findOne({
        where: {
          id: req.session.userId,
        },
      });
      const apartement = await Apartement.findByPk(req.params.idapartement);
      console.log(req.params.idapartement);
      res.render("formEditHost", { user, apartement });
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }

  static async editApartement(req, res) {
    try {
      const { idapartement } = req.params;
      const { name, rate, facility, price, location } = req.body;
      await Apartement.update(
        {
          name: name,
          rate: rate,
          facility: facility,
          price: price,
          location: location,
        },
        {
          where: {
            id: idapartement,
          },
        }
      );
      res.redirect("/host/apartement");
    } catch (error) {
      console.log(error.message);
      res.send(error);
    }
  }

  static async deleteApartement(req, res) {
    try {
      const { idapartement } = req.params;
      let dataApart = await Apartement.findByPk(idapartement);
      await Apartement.destroy({
        where: {
          id: idapartement,
        }
      });
      const info = `${dataApart.name} has been removed`;
      res.redirect(`/host/apartement?info=${info}`);
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }

  static async addRoomForm(req, res) {
    try {
      const { idapartement } = req.params;
      res.render("formAddRoom", { idapartement });
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }

  static async addRoom(req, res) {
    try {
      const { name, roomNumber } = req.body;
      const { idapartement } = req.params;
      await Room.create({ name, roomNumber, ApartementId: idapartement });
      res.redirect("/host/apartement");
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }

  static async deleteRoom(req, res) {
    try {
      const { idRoom } = req.params;
      const room = await Room.findByPk(idRoom);
      await Room.destroy({
        where: {
          id: idRoom,
        },
      });
      const info = `${room.name} has been removed`;
      res.redirect(`/host/apartement?info=${info}`);
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }

  static async getBooking (req,res){
    try {
        const { idapartement } = req.params;
        const rooms = await Apartement.findOne({
            where : {
                id : idapartement
            },
            include : Room
        })
        // res.send(rooms)
        res.render("booking",{rooms, idapartement})
    } catch (error) {
        console.log(error);
        res.send(error)
    }
  }

  static async postBooking (req,res) {
    try {
        const { idapartement } = req.params;
        const {startDate, endDate} = req.body
        const data = await Apartement.findByPk(idapartement)
        await Booking.create({
            UserId : req.session.userId,
            ApartementId : idapartement,
            startDate,
            endDate
        })
        res.redirect(`/guest/bookingsuccess`)
    } catch (error) {
        console.log(error);
        res.send(error)
    }
  }

  static async viewPDF(req,res){
    try {
        // const idapartement = req.query.id;
        // const data = await Apartement.findByPk(idapartement)
        // console.log(data);
        // let text = `successfully booking on ${data.name}`
        // const pdfdocument = new pdfkit
        // pdfdocument.pipe(fs.createWriteStream("success.pdf"))
        // pdfdocument.image('success.png', {
        //     fit: [300,350],
        //     align :"center",
        //     valign :"center"
        // })
        // pdfdocument.text(`successfully booking on ${data.name}`)
        // pdfdocument.end()
        // res.sendFile('success.pdf', { root: '/guest/bookingsuccess' });
        // res.redirect('/guest/profile')
        const stream = res.writeHead(200, {
            'Content-Type' : 'application/pdf',
            'Content-Disposition' : 'attachment;filename=invoice.pdf'
        })
        pdfService.buildPDF(
            (chunk)=>stream.write(chunk),
            () => stream.end(),
        );
        
    } catch (error) {
        res.send(error)
        console.log(error);   
    }
  }

  static async listBooking(req,res) {
    try {
        // const user = await User.findOne({
        //     where: {
        //       id: req.session.userId,
        //     },
        //   });
        let id = +req.session.userId
        const dataProfile = await Profile.showRoleAndName(id)
        console.log(dataProfile);
        const data = await User.findOne({
            where : {
                id : req.session.userId,
            }, 
            include : Apartement
        })
        // console.log(data);
        // res.send(data)
        res.render("profileBook", {data, dataProfile})
    } catch (error) {
        console.log(error);
        res.send(error)
    }
  }

  static logout(req, res) {
    req.session.destroy((err) => {
      if (!err) {
        res.redirect("/");
      }
    });
  }
}

module.exports = Controller;
