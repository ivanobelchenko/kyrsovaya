const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const { User,  Journal, Editor, Order, Price, Recommendation} = require('../models.js');


const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).render('index', {});
});
router.get('/loginPage', (req, res) => {
  res.status(200).render('login', {});
});
router.get('/editors', (req, res) => {
  res.status(200).render('editors', {});
});
router.get('/register', (req, res) => {
  res.status(200).render('register', {});
});
router.get('/profile', (req, res) => {
  res.status(200).render('profile', {});
});
router.get('/order', (req, res) => {
  res.status(200).render('order', {});
});
router.get('/admin', (req, res) => {
  res.status(200).render('admin', {});
});

router.get('/getRecommendations', async (req, res) => {
  let recommendations = await Recommendation.findAll();
  
  res.json(recommendations);
});
router.get('/getJournals', async (req, res) => {
  let journals = await Journal.findAll();
  
  res.json(journals);
});
router.get('/getEditors', async (req, res) => {
  let editors = await Editor.findAll();
  
  res.json(editors);
});
router.get('/getOrders', async (req, res) => {
  let orders = await Order.findAll();
  
  res.json(orders);
});
router.get('/getPrices', async (req, res) => {
  let prices = await Price.findAll();
  
  res.json(prices);
});
router.get('/getUsers', async (req, res) => {
  let users = await User.findAll();
  
  res.json(users);
});


router.post('/login', async (req, res) => {
  try {
    let user = await User.findOne({
      where: {
        username: req.body.username,
        password: req.body.password
      }
    });
    
    console.log(user);
    
    res.status(200).render('login', {
      username: user.dataValues.username,
      user_id: user.dataValues.id
    });
    
  } catch (e) {
    res.status(400).send('Error!');
  }
  
});

router.post('/createUser', async (req, res) => {
  let userData = {
    username: req.body.username,
    password: req.body.password
  };
  
  try {
  
    let user = await User.create(userData);
    
    res.status(200).render('register', {
      username: user.dataValues.username,
      user_id: user.dataValues.id
    });
    
  } catch (e) {
    console.log('Error while creating a user!');
    res.status(400).send(e);
  }
  
  
});

router.post('/createEditorAndJournal', async (req, res) => {
  let editorData = {
    username: req.body.username
  };
  
  let journalData = {
    model: req.body.journal_model,
    number: req.body.journal_number
  }
  
  try {
    let editor = await Editor.create(editorData);
    editor.journal_id = editor.dataValues.id;
    await editor.save();
    
    let journal = await Journal.create(journalData);
    
    res.status(200).redirect('/admin');
  } catch (e) {
    console.log('Error while creating a editor or a journal!');
    
    res.status(400).send(e);
  }
});

router.post('/updateEditorAndJournal', async (req, res) => {
  
  let reqID = req.body.id;
  
  let editorData = {
    username: req.body.username
  };
  
  let journalData = {
    number: req.body.journal_number,
    model: req.body.journal_model
  }
  

  
  try {
    let editor = await Editor.findOne({ where: { id: reqID } });
    let journal = await Journal.findOne({ where: { id: reqID } });
    
    if (editorData.username) {
      editor.username = editorData.username;
      await editor.save();
    }
    
    if (journalData.number) {
      journal.number = journalData.number;
      await journal.save();
    }
    
    if (journalData.model) {
      journal.model = journalData.model;
      await journal.save();
    }
    
    res.status(200).redirect('/admin');
  } catch (e) {
    console.log('Error while creating a editor or a journal!');
    
    res.status(400).send(e);
  }
  
  
});

router.post('/deleteEditorAndJournal', async (req, res) => {
  try {
    let reqID = req.body.id;
    
    let editor = await Editor.findOne({where: { id: reqID } });
    let journal = await Journal.findOne({ where: { id: editor.dataValues.journal_id } });
    
    console.log(editor.dataValues.isBusy);
    
    if (editor.dataValues.isBusy) {
      let order = await Order.findOne({ where: { id: editor.dataValues.order_id } });
      let recommendation = await Recommendation.findOne({ where: { id: order.dataValues.recommendation_id } });
      
      await order.destroy();
      await recommendation.destroy();
    }
    
    await editor.destroy();
    await journal.destroy();
    
    res.status(200).redirect('/admin');
  } catch (e) {
    console.log('Error while deleting an editor or a journal!');
    
    res.status(400).send(e);
  }
  
});


router.post('/createOrder', async (req, res) => {
  let recommendationData = {
    title: req.body.text_title,
    text: req.body.text,
    user_id: req.body.user_id
  };
  try {
    let recommendation = await Recommendation.create(recommendationData);
    
    let orderData = {
      recommendation_id: recommendation.dataValues.id,
      user_id: req.body.user_id
    };
    
    let order = await Order.create(orderData);
    
    let editor = await Editor.findOne({ 
      where: {
        isBusy: false
      } 
    });
    
    if (!editor) throw new Error('Все редакторы сейчас заняты');
    
    editor.order_id = order.dataValues.id;
    editor.isBusy = true;
    await editor.save();
    
    res.status(200).render('order', {});
  } catch (e) {
    console.log('Возникла ошибка');
    
    res.status(400).send(e);
  }
  
  
});

router.get('/getOrderTable', async(req, res) => {
  let orders = await Order.findAll();
  let editors = [];
  let users = [];
  let recommendations = [];
  
  try {
    for (let i = 0; i < orders.length; i++) {
      editors.push(await Editor.findOne({ where: { order_id: orders[i].dataValues.id } }));
      users.push(await User.findOne({ where: { id: orders[i].dataValues.user_id } }));
      recommendations.push(await Recommendation.findOne({ where: orders[i].dataValues.recommendation_id }));
    }
    
    res.status(200).json({orders, editors, users, recommendations});
  } catch (e) {
    res.status(200).json({orders, editors, users, recommendations});
  }
  
  
  
});

module.exports = router;