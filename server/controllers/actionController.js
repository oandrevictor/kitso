var Action = require('../models/Action');
var RequestStatus = require('../constants/requestStatus');
var DataStoreUtils = require('../utils/lib/dataStoreUtils');


// CRUD ACTION ====================================================================================

exports.index = async function(req, res) {
  let action_list, promises;
  try {
    action_list = await Action.find({}).exec();
    promises = action_list.map(injectMediaJsonInAction);
  } catch (err) {
    res.status(RequestStatus.BAD_REQUEST).json(err);
  }

  Promise.all(promises).then(function(results) {
    res.status(RequestStatus.OK).json(results);
  })
};

exports.show = async function(req, res) {
  Action.findById(req.params.action_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((result) => {
    injectMediaJsonInAction(result).then(function(results) {
      res.status(RequestStatus.OK).json(results);
    });
  });
};

exports.create = function(req, res) {
  var action = new Action(req.body);

  action.save()
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((createdAction) => {
    res.status(RequestStatus.OK).send('Ação criada.');
  });
};

exports.update = function(req, res) {
  Action.findById(req.params.action_id)
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then((action) => {
    if (req.body.name) action.name = req.body.name;
    if (req.body._action) action._action = req.body._action;
    if (req.body._user) action._user = req.body._user;
    if (req.body.action_type) action_type = req.body.action_type;

    action.save()
    .catch((err) => {
      res.status(RequestStatus.BAD_REQUEST).send(err);
    })
    .then((updateAction) => {
      res.status(RequestStatus.OK).json(updateAction);
    });
  });
};

exports.delete = function(req, res) {
  Action.remove({ _id: req.params.action_id})
  .catch((err) => {
    res.status(RequestStatus.BAD_REQUEST).send(err);
  })
  .then(() => {
    res.status(RequestStatus.OK).send('Action removed.');
  });
};


// AUXILIARY FUNCTIONS ============================================================================

var injectMediaJsonInAction = async function(action) {
  let user_id = action._user;
  let action_id = action._action;

  let user_obj = await DataStoreUtils.getUserById(user_id);
  let action_obj = await DataStoreUtils.getActionByTypeAndId(action.action_type, action_id);

  let action_complete = action;
  action_complete._user = user_obj;
  action_complete._action = action_obj;

  return action_complete;
};
