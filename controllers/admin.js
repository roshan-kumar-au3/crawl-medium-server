const Admin = require('../models/admin');
const SearchHistory = require('../models/searchhistory');

const getAdminById = (req, res, next, id) => {
    Admin.findOne({
        where: {
            id: id
        }
        }).then(admin => {
            if (!admin) {
                return res.status(400).json({
                    error: "No user was found in DB"
                })
            }
            req.profile = admin;
            next();
        }).catch(err => console.log(err));
};

const getAdmin = (req, res) => {
    req.profile.password = undefined;
    return res.json(req.profile);
};

const getAllAdmins = (req, res) => {
    User.findAll((err, admins) => {
        if (err || !admins) {
            return res.status(400).json({
                error: "No Admin Found"
            });
        }

        res.json(admins);
    })
};

const getSearchHistory = (req, res) => {
    SearchHistory.findOne({
        where: {
            admin_id: req.profile.id
        }
    }).then(history => {
        if (!history) {
            return res.status(400).json({
                error: "Not able to save"
            });
        }
        res.json(history.tags);
    }).catch(err => console.log(err));
}

module.exports = { getAdminById, getAdmin, getAllAdmins, getSearchHistory };

