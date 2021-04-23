const express = require('express');
const router = express.Router();
const { isSignedIn, isAuthenticated, } = require('../controllers/auth');
const { getAdminById, getAdmin, getAllAdmins, getSearchHistory } = require('../controllers/admin');
const { crawlMedium, crawlMediumMiddleware } = require('../controllers/crawler');

router.param("adminId", getAdminById);

router.get("/admin/:adminId", isSignedIn, isAuthenticated, getAdmin);

router.get("/admin/:adminId/crawlkeyword/", isSignedIn, isAuthenticated, crawlMediumMiddleware, crawlMedium);

router.get("/admin/:adminId/history", isSignedIn, isAuthenticated, getSearchHistory);

router.get("/admins", getAllAdmins);

module.exports = router;